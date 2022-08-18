import { zodResolver } from "@hookform/resolvers/zod";
import {
  TimeUnit,
  WorkflowActions,
  WorkflowStep,
  WorkflowTemplates,
  WorkflowTriggerEvents,
} from "@prisma/client";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { classNames } from "@calcom/lib";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import { stringOrNumber } from "@calcom/prisma/zod-utils";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { Alert } from "@calcom/ui/Alert";
import Loader from "@calcom/ui/Loader";
import { Option } from "@calcom/ui/form/MultiSelectCheckboxes";
import { Button, Form, showToast } from "@calcom/ui/v2";
import Shell from "@calcom/ui/v2/core/Shell";

import LicenseRequired from "../../../common/components/LicenseRequired";
import WorkflowDetailsPage from "../../components/v2/WorkflowDetailsPage";

export type FormValues = {
  name: string;
  activeOn: Option[];
  steps: WorkflowStep[];
  trigger: WorkflowTriggerEvents;
  time?: number;
  timeUnit?: TimeUnit;
};

const formSchema = z.object({
  name: z.string(),
  activeOn: z.object({ value: z.string(), label: z.string() }).array(),
  trigger: z.nativeEnum(WorkflowTriggerEvents),
  time: z.number().gte(0).optional(),
  timeUnit: z.nativeEnum(TimeUnit).optional(),
  steps: z
    .object({
      id: z.number(),
      stepNumber: z.number(),
      action: z.nativeEnum(WorkflowActions),
      workflowId: z.number(),
      reminderBody: z.string().nullable(),
      emailSubject: z.string().nullable(),
      template: z.nativeEnum(WorkflowTemplates),
      sendTo: z
        .string()
        .refine((val) => isValidPhoneNumber(val))
        .nullable(),
    })
    .array(),
});

const querySchema = z.object({
  workflow: stringOrNumber,
});

function WorkflowPage() {
  const { t } = useLocale();
  const session = useSession();
  const router = useRouter();
  const me = useMeQuery();

  const [selectedEventTypes, setSelectedEventTypes] = useState<Option[]>([]);
  const [isAllDataLoaded, setIsAllDataLoaded] = useState(false);
  const [editCounter, setEditCounter] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const { workflow: workflowId } = router.isReady ? querySchema.parse(router.query) : { workflow: -1 };
  const utils = trpc.useContext();

  const {
    data: workflow,
    isError,
    error,
    dataUpdatedAt,
  } = trpc.useQuery(["viewer.workflows.get", { id: +workflowId }], {
    enabled: router.isReady && !!workflowId,
  });

  useEffect(() => {
    if (workflow) {
      setSelectedEventTypes(
        workflow.activeOn.map((active) => ({
          value: String(active.eventType.id),
          label: active.eventType.title,
        })) || []
      );
      const activeOn = workflow.activeOn
        ? workflow.activeOn.map((active) => ({
            value: active.eventType.id.toString(),
            label: active.eventType.slug,
          }))
        : undefined;
      form.setValue("name", workflow.name);
      form.setValue("steps", workflow.steps);
      form.setValue("trigger", workflow.trigger);
      form.setValue("time", workflow.time || undefined);
      form.setValue("timeUnit", workflow.timeUnit || undefined);
      form.setValue("activeOn", activeOn || []);
      setIsAllDataLoaded(true);
    }
  }, [dataUpdatedAt]);

  const updateMutation = trpc.useMutation("viewer.workflows.update", {
    onSuccess: async ({ workflow }) => {
      if (workflow) {
        utils.setQueryData(["viewer.workflows.get", { id: +workflow.id }], workflow);

        showToast(
          t("workflow_updated_successfully", {
            workflowName: workflow.name,
          }),
          "success"
        );
      }
      await router.push("/workflows");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  return session.data ? (
    <Form
      form={form}
      handleSubmit={async (values) => {
        let activeOnEventTypeIds: number[] = [];
        if (values.activeOn) {
          activeOnEventTypeIds = values.activeOn.map((option) => {
            return parseInt(option.value, 10);
          });
        }
        updateMutation.mutate({
          id: parseInt(router.query.workflow as string, 10),
          name: values.name,
          activeOn: activeOnEventTypeIds,
          steps: values.steps,
          trigger: values.trigger,
          time: values.time || null,
          timeUnit: values.timeUnit || null,
        });
      }}>
      <Shell
        title="Title"
        CTA={
          <div>
            <Button type="submit" disabled={updateMutation.isLoading || editCounter > 0}>
              {t("save")}
            </Button>
          </div>
        }
        heading={
          session.data?.hasValidLicense &&
          isAllDataLoaded && (
            <div className={classNames(!form.getValues("name") ? "text-gray-400" : "")}>
              {form.getValues("name") ? form.getValues("name") : "untitled"}
            </div>
          )
        }>
        <LicenseRequired>
          <>
            {!isError ? (
              <>
                {isAllDataLoaded ? (
                  <>
                    <WorkflowDetailsPage
                      form={form}
                      editCounter={editCounter}
                      setEditCounter={setEditCounter}
                      workflowId={+workflowId}
                      selectedEventTypes={selectedEventTypes}
                      setSelectedEventTypes={setSelectedEventTypes}
                    />
                  </>
                ) : (
                  <Loader />
                )}
              </>
            ) : (
              <Alert severity="error" title="Something went wrong" message={error.message} />
            )}
          </>
        </LicenseRequired>
      </Shell>
    </Form>
  ) : (
    <Loader />
  );
}

export default WorkflowPage;
