import type { PrismaClient } from "@calcom/prisma";
import prismaDefault from "@calcom/prisma";
import { deleteAllWorkflowReminders } from "@calcom/trpc/server/routers/viewer/workflows/util";

// cancel/delete all workflowReminders of the removed member that come from that team (org teams only)
export async function deleteWorkfowRemindersOfRemovedMember(
  team: {
    id: number;
    parentId?: number | null;
  },
  memberId: number,
  otherTeams: { id: number; parentId: number | null }[],
  isOrg: boolean,
  prisma: PrismaClient = prismaDefault
) {
  if (!team.parentId) return;

  if (isOrg) {
    // if member was removed from org, delete all workflowReminders of the removed team member that come from org workflows
    const workflowRemindersToDelete = await prisma.workflowReminder.findMany({
      where: {
        workflowStep: {
          workflow: {
            teamId: team.id,
          },
        },
        booking: {
          eventType: {
            userId: memberId,
          },
        },
      },
      select: {
        id: true,
        referenceId: true,
        method: true,
      },
    });

    deleteAllWorkflowReminders(workflowRemindersToDelete, prisma);
  } else {
    // member was removed from an org team
    const isUserMemberOfOtherTeams = !otherTeams.filter((team) => team.id !== team.id && !!team.parentId)
      .length;

    const removedWorkflows = await prisma.workflow.findMany({
      where: {
        OR: [
          {
            activeOnTeams: {
              some: {
                teamId: team.id,
              },
              //don't delete reminder, if user is still part of another team that is active on this workflow
              none: {
                team: {
                  members: {
                    some: {
                      userId: memberId,
                    },
                  },
                },
              },
            },
            // if user is still a member of other teams in the org, we also need to make sure that the found workflow is not active on all teams
            ...(isUserMemberOfOtherTeams && {
              isActiveOnAll: false,
            }),
          },
          {
            // workflows of the org that are set active on all teams (and the user is not member of any other team)
            teamId: team.parentId,
            ...(!isUserMemberOfOtherTeams && {
              isActiveOnAll: true,
            }),
          },
        ],
      },
    });

    const workflowRemindersToDelete = await prisma.workflowReminder.findMany({
      where: {
        workflowStep: {
          workflowId: {
            in: removedWorkflows?.map((workflow) => workflow.id) ?? [],
          },
        },
        booking: {
          eventType: {
            userId: memberId,
          },
        },
      },
      select: {
        id: true,
        referenceId: true,
        method: true,
      },
    });
    deleteAllWorkflowReminders(workflowRemindersToDelete, prisma);
  }
}
