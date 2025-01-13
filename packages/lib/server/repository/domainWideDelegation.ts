import type { Prisma } from "@prisma/client";
import z from "zod";

import { getFeatureFlag } from "@calcom/features/flags/server/utils";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";

import { OrganizationRepository } from "./organization";

const serviceAccountKeySchema = z
  .object({
    client_email: z.string(),
    private_key: z.string(),
    client_id: z.string(),
  })
  .passthrough();

export type ServiceAccountKey = z.infer<typeof serviceAccountKeySchema>;

const repositoryLogger = logger.getSubLogger({ prefix: ["DomainWideDelegationRepository"] });
const domainWideDelegationSafeSelect = {
  id: true,
  enabled: true,
  domain: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
  workspacePlatform: {
    select: {
      name: true,
      slug: true,
    },
  },
};

const domainWideDelegationSelectIncludesServiceAccountKey = {
  ...domainWideDelegationSafeSelect,
  serviceAccountKey: true,
};

export class DomainWideDelegationRepository {
  private static withParsedServiceAccountKey<T extends { serviceAccountKey: Prisma.JsonValue } | null>(
    domainWideDelegation: T
  ) {
    if (!domainWideDelegation) {
      return null;
    }
    const parsedServiceAccountKey = serviceAccountKeySchema.safeParse(domainWideDelegation.serviceAccountKey);

    return {
      ...domainWideDelegation,
      serviceAccountKey: parsedServiceAccountKey.success ? parsedServiceAccountKey.data : null,
    };
  }

  static async create(data: {
    domain: string;
    enabled: boolean;
    organizationId: number;
    workspacePlatformId: number;
    serviceAccountKey: Exclude<Prisma.JsonValue, null>;
  }) {
    return await prisma.domainWideDelegation.create({
      data: {
        workspacePlatform: {
          connect: {
            id: data.workspacePlatformId,
          },
        },
        domain: data.domain,
        enabled: data.enabled,
        organization: {
          connect: {
            id: data.organizationId,
          },
        },
        serviceAccountKey: data.serviceAccountKey,
      },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async findById({ id }: { id: string }) {
    return await prisma.domainWideDelegation.findUnique({
      where: { id },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async findUniqueByOrganizationIdAndDomain({
    organizationId,
    domain,
  }: {
    organizationId: number;
    domain: string;
  }) {
    return await prisma.domainWideDelegation.findUnique({
      where: { organizationId_domain: { organizationId, domain } },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async findByIdIncludeSensitiveServiceAccountKey({ id }: { id: string }) {
    const domainWideDelegation = await prisma.domainWideDelegation.findUnique({
      where: { id },
      select: domainWideDelegationSelectIncludesServiceAccountKey,
    });
    if (!domainWideDelegation) return null;
    return DomainWideDelegationRepository.withParsedServiceAccountKey(domainWideDelegation);
  }

  static async findUniqueByOrganizationMemberEmail({ email }: { email: string }) {
    const log = repositoryLogger.getSubLogger({ prefix: ["findUniqueByOrganizationMemberEmail"] });
    log.debug("called with", { email });
    const organization = await OrganizationRepository.findByMemberEmail({ email });
    if (!organization) {
      log.debug("Email not found in any organization:", email);
      return null;
    }

    const emailDomain = email.split("@")[1];
    const domainWideDelegation = await prisma.domainWideDelegation.findUnique({
      where: {
        organizationId_domain: {
          organizationId: organization.id,
          domain: emailDomain,
        },
      },
      select: domainWideDelegationSafeSelect,
    });

    return domainWideDelegation;
  }

  static async findByUser({ user }: { user: { email: string } }) {
    return await DomainWideDelegationRepository.findUniqueByOrganizationMemberEmail({ email: user.email });
  }

  static async findAllByDomain({ domain }: { domain: string }) {
    return await prisma.domainWideDelegation.findMany({
      where: { domain },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async findFirstByOrganizationId({ organizationId }: { organizationId: number }) {
    const domainWideDelegationEnabled = await getFeatureFlag(prisma, "domain-wide-delegation");
    if (!domainWideDelegationEnabled) {
      return null;
    }

    return await prisma.domainWideDelegation.findFirst({
      where: { organizationId },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async updateById({
    id,
    data,
  }: {
    id: string;
    data: Partial<{
      workspacePlatformId: number;
      domain: string;
      enabled: boolean;
      organizationId: number;
    }>;
  }) {
    const { workspacePlatformId, organizationId, ...rest } = data;
    return await prisma.domainWideDelegation.update({
      where: { id },
      data: {
        ...(workspacePlatformId && {
          workspacePlatform: {
            connect: {
              id: workspacePlatformId,
            },
          },
        }),
        ...(organizationId && {
          organization: {
            connect: {
              id: organizationId,
            },
          },
        }),
        ...rest,
      },
      select: domainWideDelegationSafeSelect,
    });
  }

  static async deleteById({ id }: { id: string }) {
    return await prisma.domainWideDelegation.delete({
      where: { id },
    });
  }

  static async findDelegationsWithServiceAccount({ organizationId }: { organizationId: number }) {
    return await prisma.domainWideDelegation.findMany({
      where: { organizationId },
      select: {
        ...domainWideDelegationSelectIncludesServiceAccountKey,
        workspacePlatform: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  static async findByIdsIncludeSensitiveServiceAccountKey(ids: string[]) {
    if (ids.length === 0) return [];
    const domainWideDelegations = await prisma.domainWideDelegation.findMany({
      where: {
        id: {
          in: ids,
        },
        enabled: true,
      },
      select: domainWideDelegationSelectIncludesServiceAccountKey,
    });

    return domainWideDelegations
      .map((dwd) => DomainWideDelegationRepository.withParsedServiceAccountKey(dwd))
      .filter((dwd): dwd is NonNullable<typeof dwd> => dwd !== null);
  }
}
