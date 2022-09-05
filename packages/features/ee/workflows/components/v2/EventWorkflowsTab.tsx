import { WorkflowActions } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui";
import { Button, Loader, showToast, Switch, Tooltip } from "@calcom/ui/v2";

import LicenseRequired from "../../../common/components/v2/LicenseRequired";
import { getActionIcon } from "../../lib/getActionIcon";
import EmptyScreen from "./EmptyScreen";
import { WorkflowType } from "./WorkflowListPage";

type ItemProps = {
  workflow: WorkflowType;
  eventType: {
    id: number;
    title: string;
  };
};

const WorkflowListItem = (props: ItemProps) => {
  const { workflow, eventType } = props;
  const { t } = useLocale();

  const [activeEventTypeIds, setActiveEventTypeIds] = useState(
    workflow.activeOn.map((active) => {
      if (active.eventType) {
        return active.eventType.id;
      }
    })
  );

  const isActive = activeEventTypeIds.includes(eventType.id);

  const activateEventTypeMutation = trpc.useMutation("viewer.workflows.activateEventType", {
    onSuccess: async () => {
      let offOn = "";
      if (activeEventTypeIds.includes(eventType.id)) {
        const newActiveEventTypeIds = activeEventTypeIds.filter((id) => {
          return id !== eventType.id;
        });
        setActiveEventTypeIds(newActiveEventTypeIds);
        offOn = "off";
      } else {
        const newActiveEventTypeIds = activeEventTypeIds;
        newActiveEventTypeIds.push(eventType.id);
        setActiveEventTypeIds(newActiveEventTypeIds);
        offOn = "on";
      }
      showToast(
        t("workflow_turned_on_successfully", {
          workflowName: workflow.name,
          offOn,
        }),
        "success"
      );
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  const sendTo: Set<string> = new Set();

  workflow.steps.forEach((step) => {
    switch (step.action) {
      case WorkflowActions.EMAIL_HOST:
        sendTo.add(t("organizer_name_workflow"));
        break;
      case WorkflowActions.EMAIL_ATTENDEE:
        sendTo.add(t("attendee_name_workflow"));
        break;
      case WorkflowActions.SMS_ATTENDEE:
        sendTo.add(t("attendee_name_workflow"));
        break;
      case WorkflowActions.SMS_NUMBER:
        sendTo.add(step.sendTo || "");
        break;
    }
  });

  return (
    <div className="mb-4 flex w-full items-center overflow-hidden rounded-md border border-gray-200 p-4">
      <div className="mr-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 p-1 text-xs font-medium sm:flex sm:h-10 sm:w-10">
        {getActionIcon(
          workflow.steps,
          isActive
            ? "sm:h-7 sm:w-7 w-[17px] h-[17px] stroke-[1.5px] text-gray-700"
            : "h-7 w-7 w-[25px] h-[25px] stroke-[1.5px] text-gray-400"
        )}
      </div>
      <div className="grow sm:ml-4">
        <div
          className={classNames(
            "w-full truncate text-sm font-medium leading-6 text-gray-900 md:max-w-max",
            workflow.name && isActive ? "text-gray-900" : "text-neutral-500"
          )}>
          {workflow.name
            ? workflow.name
            : "Untitled (" +
              `${t(`${workflow.steps[0].action.toLowerCase()}_action`)}`.charAt(0).toUpperCase() +
              `${t(`${workflow.steps[0].action.toLowerCase()}_action`)}`.slice(1) +
              ")"}
        </div>
        <div
          className={classNames(
            "mb-1 flex w-fit items-center whitespace-nowrap  rounded-sm py-px text-sm",
            isActive ? "text-gray-600" : "text-gray-400"
          )}>
          <span className="mr-1">{t("to")}:</span>
          {Array.from(sendTo).map((sendToPerson, index) => {
            return <span key={index}>{`${index ? ", " : ""}${sendToPerson}`}</span>;
          })}
        </div>
      </div>
      <div className="flex-none">
        <Link href={`/workflows/${workflow.id}`} passHref={true}>
          <a target="_blank">
            <Button type="button" color="minimal" className="text-sm text-gray-900 hover:bg-transparent">
              <div className="mr-2 hidden sm:block">{t("edit")}</div>
              <Icon.FiExternalLink className="-mt-[2px] h-4 w-4 stroke-2 text-gray-600" />
            </Button>
          </a>
        </Link>
      </div>
      <Tooltip content={t("turn_off") as string}>
        <div className="">
          <Switch
            checked={isActive}
            onCheckedChange={() => {
              activateEventTypeMutation.mutate({ workflowId: workflow.id, eventTypeId: eventType.id });
            }}
          />
        </div>
      </Tooltip>
    </div>
  );
};

type Props = {
  eventType: {
    id: number;
    title: string;
  };
  workflows: WorkflowType[];
};

function EventWorkflowsTab(props: Props) {
  const { workflows } = props;
  const { t } = useLocale();
  const { data, isLoading } = trpc.useQuery(["viewer.workflows.list"]);
  const router = useRouter();
  const [sortedWorkflows, setSortedWorkflows] = useState<Array<WorkflowType>>([]);

  useEffect(() => {
    if (data?.workflows) {
      const activeWorkflows = workflows.map((workflowOnEventType) => {
        return workflowOnEventType;
      });
      const disabledWorkflows = data.workflows.filter(
        (workflow) =>
          !workflows
            .map((workflow) => {
              return workflow.id;
            })
            .includes(workflow.id)
      );
      setSortedWorkflows(activeWorkflows.concat(disabledWorkflows));
    }
  }, [isLoading]);

  const createMutation = trpc.useMutation("viewer.workflows.createV2", {
    onSuccess: async ({ workflow }) => {
      await router.replace("/workflows/" + workflow.id);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }

      if (err.data?.code === "UNAUTHORIZED") {
        const message = `${err.data.code}: You are not able to create this workflow`;
        showToast(message, "error");
      }
    },
  });

  return (
    <LicenseRequired>
      {!isLoading ? (
        data?.workflows && data?.workflows.length > 0 ? (
          <div className="mt-4">
            {sortedWorkflows.map((workflow) => {
              return <WorkflowListItem key={workflow.id} workflow={workflow} eventType={props.eventType} />;
            })}
          </div>
        ) : (
          <EmptyScreen
            buttonText={t("create_workflow")}
            buttonOnClick={() => createMutation.mutate()}
            IconHeading={Icon.FiZap}
            headline={t("workflows")}
            description={t("no_workflows_description")}
            isLoading={createMutation.isLoading}
            showExampleWorkflows={false}
          />
        )
      ) : (
        <Loader />
      )}
    </LicenseRequired>
  );
}

export default EventWorkflowsTab;
