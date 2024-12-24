// TODO: Queries in this file are not optimized. Need to optimize them.
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";
import type { AttributeType } from "@calcom/prisma/enums";

import { AttributeRepository } from "../../../server/repository/attribute";
import { AttributeToUserRepository } from "../../../server/repository/attributeToUser";
import { MembershipRepository } from "../../../server/repository/membership";
import type { AttributeId } from "../types";

type UserId = number;

export type Attribute = {
  name: string;
  slug: string;
  type: AttributeType;
  id: string;
  options: {
    id: string;
    value: string;
    slug: string;
  }[];
};

export type AttributeOptionValue = {
  value: string;
  isGroup: boolean;
  contains: {
    id: string;
    slug: string;
    value: string;
  }[];
};

export type AttributeOptionValueWithType = {
  type: Attribute["type"];
  attributeOption: AttributeOptionValue | AttributeOptionValue[];
};

function _prepareAssignmentData({
  assignmentsForTheTeam,
  attributesOfTheOrg,
}: {
  assignmentsForTheTeam: {
    userId: number;
    attributeOption: {
      id: string;
      value: string;
      slug: string;
      contains: string[];
      isGroup: boolean;
    };
    attribute: {
      id: string;
      name: string;
      type: AttributeType;
    };
  }[];
  attributesOfTheOrg: {
    id: string;
    options: {
      id: string;
      value: string;
      slug: string;
    }[];
  }[];
}) {
  const teamMembersThatHaveOptionAssigned = assignmentsForTheTeam.reduce((acc, attributeToUser) => {
    const userId = attributeToUser.userId;
    const attributeOption = attributeToUser.attributeOption;
    const attribute = attributeToUser.attribute;

    if (!acc[userId]) {
      acc[userId] = { userId, attributes: {} };
    }

    const attributes = acc[userId].attributes;
    const currentAttributeOptionValue = attributes[attribute.id]?.attributeOption;
    const newAttributeOptionValue = {
      isGroup: attributeOption.isGroup,
      value: attributeOption.value,
      contains: tranformContains({ contains: attributeOption.contains, attribute }),
    };

    if (currentAttributeOptionValue instanceof Array) {
      attributes[attribute.id].attributeOption = [...currentAttributeOptionValue, newAttributeOptionValue];
    } else if (currentAttributeOptionValue) {
      attributes[attribute.id].attributeOption = [
        currentAttributeOptionValue,
        {
          isGroup: attributeOption.isGroup,
          value: attributeOption.value,
          contains: tranformContains({ contains: attributeOption.contains, attribute }),
        },
      ];
    } else {
      // Set the first value
      attributes[attribute.id] = {
        type: attribute.type,
        attributeOption: newAttributeOptionValue,
      };
    }
    return acc;
  }, {} as Record<UserId, { userId: UserId; attributes: Record<AttributeId, AttributeOptionValueWithType> }>);

  return Object.values(teamMembersThatHaveOptionAssigned);

  /**
   * Transforms ["optionId1", "optionId2"] to [{
   *   id: "optionId1",
   *   value: "optionValue1",
   *   slug: "optionSlug1",
   * }, {
   *   id: "optionId2",
   *   value: "optionValue2",
   *   slug: "optionSlug2",
   * }]
   */
  function tranformContains({
    contains,
    attribute,
  }: {
    contains: string[];
    attribute: { id: string; name: string };
  }) {
    return contains
      .map((optionId) => {
        const allOptions = attributesOfTheOrg.find((_attribute) => _attribute.id === attribute.id)?.options;
        const option = allOptions?.find((option) => option.id === optionId);
        if (!option) {
          console.error(
            `Enriching "contains" for attribute ${
              attribute.name
            }: Option with id ${optionId} not found. Looked up in ${JSON.stringify(allOptions)}`
          );
          return null;
        }
        return {
          id: option.id,
          value: option.value,
          slug: option.slug,
        };
      })
      .filter((option): option is NonNullable<typeof option> => option !== null);
  }
}

function _getAttributeFromAttributeOption({
  allAttributesOfTheOrg,
  attributeOptionId,
}: {
  allAttributesOfTheOrg: {
    id: string;
    name: string;
    type: AttributeType;
    options: {
      id: string;
      value: string;
      slug: string;
    }[];
  }[];
  attributeOptionId: string;
}) {
  return allAttributesOfTheOrg.find((attribute) =>
    attribute.options.some((option) => option.id === attributeOptionId)
  );
}

function _getAttributeOptionFromAttributeOption({
  allAttributesOfTheOrg,
  attributeOptionId,
}: {
  allAttributesOfTheOrg: {
    id: string;
    name: string;
    type: AttributeType;
    options: {
      id: string;
      value: string;
      slug: string;
      contains: string[];
      isGroup: boolean;
    }[];
  }[];
  attributeOptionId: string;
}) {
  const matchingOption = allAttributesOfTheOrg.reduce((found, attribute) => {
    if (found) return found;
    return attribute.options.find((option) => option.id === attributeOptionId) || null;
  }, null as null | (typeof allAttributesOfTheOrg)[number]["options"][number]);
  return matchingOption;
}

async function _getOrgMembershipToUserIdForTeam({ orgId, teamId }: { orgId: number; teamId: number }) {
  const { orgMemberships, teamMemberships } = await MembershipRepository.findMembershipsForOrgAndTeam({
    orgId,
    teamId,
  });

  type MembershipId = number;
  type UserId = number;

  const orgMembershipToUserIdForTeamMembers = new Map<MembershipId, UserId>();

  /**
   * For an organization with 3000 users and 10 teams, with every team having around 300 members, the total memberships we query from DB are 3000+300 = 3300
   * So, these are not a lot of records and we could afford to do in memory computations on them.
   *
   */
  teamMemberships.forEach((teamMembership) => {
    const orgMembership = orgMemberships.find(
      (orgMembership) => orgMembership.userId === teamMembership.userId
    );
    if (!orgMembership) {
      console.error(
        `Org membership not found for userId ${teamMembership.userId} in the organization's memberships`
      );
      return;
    }
    orgMembershipToUserIdForTeamMembers.set(orgMembership.id, orgMembership.userId);
  });

  return orgMembershipToUserIdForTeamMembers;
}

async function getAttributesAssignedToMembersOfTeam({ teamId, userId }: { teamId: number; userId?: number }) {
  const log = logger.getSubLogger({ prefix: ["getAttributeToUserWithMembershipAndAttributes"] });

  const whereClauseForAttributesAssignedToMembersOfTeam = {
    options: {
      some: {
        assignedUsers: {
          some: {
            member: {
              userId,
              user: {
                teams: {
                  some: {
                    teamId,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  log.debug(
    safeStringify({
      teamId,
      whereClauseForAttributesAssignedToMembersOfTeam,
    })
  );

  const assignedAttributeOptions = await prisma.attribute.findMany({
    where: whereClauseForAttributesAssignedToMembersOfTeam,
    select: {
      id: true,
      name: true,
      type: true,
      options: {
        select: {
          id: true,
          value: true,
          slug: true,
        },
      },
      slug: true,
    },
  });

  return assignedAttributeOptions;
}

export async function getAllData({ orgId, teamId }: { orgId: number; teamId: number }) {
  // Get all the attributes with their options first.
  const [orgMembershipToUserIdForTeamMembers, attributesOfTheOrg] = await Promise.all([
    _getOrgMembershipToUserIdForTeam({ orgId, teamId }),
    AttributeRepository.findManyByOrgId({ orgId }),
  ]);

  // Get all the attributes assigned to the members of the team
  const attributesToUsersForTeam = await AttributeToUserRepository.findManyByTeamMembershipIds({
    teamMembershipIds: Array.from(orgMembershipToUserIdForTeamMembers.keys()),
  });

  return {
    attributesOfTheOrg,
    attributesToUsersForTeam,
    orgMembershipToUserIdForTeamMembers,
  };
}

export async function getAttributesAssignmentData({ orgId, teamId }: { orgId: number; teamId: number }) {
  const { attributesOfTheOrg, attributesToUsersForTeam, orgMembershipToUserIdForTeamMembers } =
    await getAllData({
      orgId,
      teamId,
    });

  const assignmentsForTheTeam = attributesToUsersForTeam.map((attributeToUser) => {
    const orgMembershipId = attributeToUser.memberId;
    const userId = orgMembershipToUserIdForTeamMembers.get(orgMembershipId);
    if (!userId) {
      throw new Error(`No org membership found for membership id ${orgMembershipId}`);
    }
    const attribute = _getAttributeFromAttributeOption({
      allAttributesOfTheOrg: attributesOfTheOrg,
      attributeOptionId: attributeToUser.attributeOptionId,
    });

    const attributeOption = _getAttributeOptionFromAttributeOption({
      allAttributesOfTheOrg: attributesOfTheOrg,
      attributeOptionId: attributeToUser.attributeOptionId,
    });

    if (!attributeOption || !attribute) {
      throw new Error(
        `Attribute option with id ${attributeToUser.attributeOptionId} not found in the organization's attributes`
      );
    }

    return {
      ...attributeToUser,
      userId,
      attribute,
      attributeOption,
    };
  });

  const attributesAssignedToTeamMembersWithOptions = _prepareAssignmentData({
    attributesOfTheOrg,
    assignmentsForTheTeam,
  });

  return {
    attributesOfTheOrg,
    attributesAssignedToTeamMembersWithOptions,
  };
}

export async function getAttributesForTeam({ teamId }: { teamId: number }) {
  const attributes = await getAttributesAssignedToMembersOfTeam({ teamId });
  return attributes satisfies Attribute[];
}

export async function getUsersAttributes({ userId, teamId }: { userId: number; teamId: number }) {
  return await getAttributesAssignedToMembersOfTeam({ teamId, userId });
}
