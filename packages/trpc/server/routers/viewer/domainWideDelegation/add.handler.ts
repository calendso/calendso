import type { z } from "zod";

import { DomainWideDelegationRepository } from "@calcom/lib/server/repository/domainWideDelegation";
import { WorkspacePlatformRepository } from "@calcom/lib/server/repository/workspacePlatform";

import { TRPCError } from "@trpc/server";

import type { DomainWideDelegationCreateSchema } from "./schema";
import { ensureNoServiceAccountKey, handleDomainWideDelegationError } from "./utils";

export default async function handler({
  input,
  ctx,
}: {
  input: z.infer<typeof DomainWideDelegationCreateSchema>;
  ctx: { user: { id: number; organizationId: number | null } };
}) {
  const { workspacePlatformSlug, domain } = input;
  const { user } = ctx;
  const { organizationId } = user;

  if (!organizationId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be part of an organization to add a domain-wide delegation",
    });
  }

  try {
    const workspacePlatform = await WorkspacePlatformRepository.findBySlugIncludeSensitiveServiceAccountKey({
      slug: workspacePlatformSlug,
    });

    if (!workspacePlatform) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Workspace platform ${workspacePlatformSlug} not found`,
      });
    }

    const existingDelegationForDomain = await DomainWideDelegationRepository.findFirstByDomain({
      domain,
    });

    if (existingDelegationForDomain) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Domain ${domain} already has a domain-wide delegation`,
      });
    }

    const createdDelegation = await DomainWideDelegationRepository.create({
      workspacePlatformId: workspacePlatform.id,
      domain,
      enabled: true,
      organizationId,
      serviceAccountKey: workspacePlatform.defaultServiceAccountKey,
    });

    return ensureNoServiceAccountKey(createdDelegation);
  } catch (error) {
    handleDomainWideDelegationError(error);
  }
}