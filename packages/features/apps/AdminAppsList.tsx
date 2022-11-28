import { AppCategories } from "@prisma/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import AppCategoryNavigation from "@calcom/app-store/_components/AppCategoryNavigation";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  Dialog,
  DialogContent,
  Form,
  KeyField,
  showToast,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  Switch,
  VerticalDivider,
  Icon,
  TextField,
} from "@calcom/ui";

const IntegrationContainer = ({ app, lastEntry, category }) => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const [disableDialog, setDisableDialog] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const formMethods = useForm();

  const enableAppMutation = trpc.viewer.appsRouter.toggle.useMutation({
    onSuccess: (enabled) => {
      utils.viewer.appsRouter.listLocal.invalidate({ category });
      setDisableDialog(false);
      showToast(
        enabled ? t("app_is_enabled", { appName: app.name }) : t("app_is_disabled", { appName: app.name }),
        "success"
      );
    },
  });

  const saveKeysMutation = trpc.viewer.appsRouter.saveKeys.useMutation({
    onSuccess: () => {
      showToast(t("keys_have_been_saved"), "success");
    },
  });

  return (
    <>
      <Collapsible key={app.name} open={showKeys}>
        <div className={`${!lastEntry && "border-b"}`}>
          <div className="flex w-full flex-1 items-center justify-between space-x-3 p-4 rtl:space-x-reverse md:max-w-3xl">
            {
              // eslint-disable-next-line @next/next/no-img-element
              app.logo && <img className="h-10 w-10" src={app.logo} alt={app.title} />
            }
            <div className="flex-grow truncate pl-2">
              <h3 className="truncate text-sm font-medium text-neutral-900">
                <p>{app.name || app.title}</p>
              </h3>
              <p className="truncate text-sm text-gray-500">{app.description}</p>
            </div>
            <div className="flex justify-self-end">
              <Switch
                checked={app.enabled}
                onClick={() => {
                  if (app.enabled) {
                    setDisableDialog(true);
                  } else {
                    enableAppMutation.mutate({ slug: app.slug, enabled: app.enabled });
                    setShowKeys(true);
                  }
                }}
              />

              <VerticalDivider className="h-10" />

              <CollapsibleTrigger>
                <Button
                  color="secondary"
                  size="icon"
                  tooltip={t("edit_keys")}
                  onClick={() => setShowKeys(!showKeys)}>
                  <Icon.FiEdit />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            {app.keys && (
              <Form
                form={formMethods}
                handleSubmit={(values) =>
                  saveKeysMutation.mutate({ slug: app.slug, type: app.type, keys: values })
                }
                className="px-4 pb-4">
                {Object.keys(app.keys)?.map((key) => (
                  <Controller
                    name={key}
                    key={key}
                    control={formMethods.control}
                    defaultValue={app.keys[key]}
                    render={({ field: { value } }) => (
                      <TextField
                        label={key}
                        key={key}
                        name={key}
                        value={value}
                        onChange={(e) => {
                          formMethods.setValue(key, e?.target.value);
                        }}
                      />
                    )}
                  />
                ))}
                <Button type="submit">Save</Button>
              </Form>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Dialog open={disableDialog} onOpenChange={setDisableDialog}>
        <DialogContent
          title={t("disable_app")}
          type="confirmation"
          description={t("disable_app_description")}
          actionText={t("disable")}
          actionOnClick={() => {
            enableAppMutation.mutate({ slug: app.slug, enabled: app.enabled });
          }}
        />
      </Dialog>
    </>
  );
};

const querySchema = z.object({
  category: z
    .nativeEnum({ ...AppCategories, conferencing: "conferencing" })
    .optional()
    .default(AppCategories.calendar),
});

const AdminAppsList = ({ baseURL }: { baseURL: string }) => {
  const router = useRouter();
  const { category } = querySchema.parse(router.query);

  const { data: apps, isLoading } = trpc.viewer.appsRouter.listLocal.useQuery(
    { category },
    {
      enabled: router.isReady,
      onSuccess: () => {
        console.log("Fetched");
      },
    }
  );

  return (
    <AppCategoryNavigation baseURL={baseURL} containerClassname="w-full xl:mx-5 xl:w-2/3 xl:pr-5">
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="rounded-md border border-gray-200">
          {apps?.map((app, index) => (
            <IntegrationContainer
              app={app}
              lastEntry={index === apps?.length - 1}
              key={app.name}
              category={category}
            />
          ))}
        </div>
      )}
    </AppCategoryNavigation>
  );
};

export default AdminAppsList;

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};
