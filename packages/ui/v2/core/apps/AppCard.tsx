import type { Credential } from "@prisma/client";

import useAddAppMutation from "@calcom/app-store/_utils/useAddAppMutation";
import { InstallAppButton } from "@calcom/app-store/components";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { trpc } from "@calcom/trpc/react";
import { App } from "@calcom/types/App";
import Badge from "@calcom/ui/Badge";
import { Icon } from "@calcom/ui/Icon";
import Button from "@calcom/ui/v2/core/Button";

interface AppCardProps {
  app: App;
  credentials?: Credential[] | undefined;
}

export default function AppCard({ app, credentials }: AppCardProps) {
  const { t } = useLocale();
  const { data: user } = trpc.useQuery(["viewer.me"]);

  const mutation = useAddAppMutation(null, {
    onSuccess: () => {
      showToast(t("app_successfully_installed"), "success");
    },
    onError: (error) => {
      if (error instanceof Error) showToast(error.message || t("app_could_not_be_installed"), "error");
    },
  });

  const allowedMultipleInstalls = app.categories && app.categories.indexOf("calendar") > -1;
  const appAdded = (credentials && credentials.length) || 0;

  return (
    <div
      className="relative flex h-64 flex-col rounded-md border border-gray-300 p-5"
      data-testid={`app-store-app-card-${app.slug}`}>
      <div className="flex">
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.logo} alt={app.name + " Logo"} className="mb-4 h-12 w-12 rounded-sm" />
        }
      </div>
      <div className="flex items-center">
        <h3 className="font-medium">{app.name}</h3>
      </div>
      {/* TODO: add reviews <div className="flex text-sm text-gray-800">
          <span>{props.rating} stars</span> <StarIcon className="ml-1 mt-0.5 h-4 w-4 text-yellow-600" />
          <span className="pl-1 text-gray-500">{props.reviews} reviews</span>
        </div> */}
      <p
        className="mt-2 flex-grow text-sm text-gray-500"
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: "3",
        }}>
        {app.description}
      </p>
      <div className="mt-5 flex w-full justify-between space-x-2">
        <Button color="secondary" className="flex w-full justify-center" href={"/apps/" + app.slug}>
          Details
        </Button>
        {app.isGlobal || (credentials && credentials.length > 0 && allowedMultipleInstalls)
          ? !app.isGlobal && (
              <InstallAppButton
                type={app.type}
                isProOnly={app.isProOnly}
                render={({ useDefaultComponent, ...props }) => {
                  if (useDefaultComponent) {
                    props = {
                      onClick: () => {
                        mutation.mutate({ type: app.type });
                      },
                    };
                  }
                  return (
                    <Button color="secondary" StartIcon={Icon.FiPlus} {...props}>
                      {t("add")}
                    </Button>
                  );
                }}
              />
            )
          : credentials &&
            credentials.length === 0 && (
              <InstallAppButton
                type={app.type}
                isProOnly={app.isProOnly}
                render={({ useDefaultComponent, ...props }) => {
                  if (useDefaultComponent) {
                    props = {
                      onClick: () => {
                        mutation.mutate({ type: app.type });
                      },
                    };
                  }
                  return (
                    <Button
                      StartIcon={Icon.FiPlus}
                      color="secondary"
                      data-testid="install-app-button"
                      {...props}>
                      {t("add")}
                    </Button>
                  );
                }}
              />
            )}
      </div>
      <div className="max-w-44 absolute right-0 mr-4 flex flex-wrap justify-end gap-1">
        {appAdded > 0 && (
          <span className="rounded-md bg-green-100 px-2 py-1 text-sm font-normal text-green-800">
            {t("added", { count: appAdded })}
          </span>
        )}
        {app.isGlobal && (
          <span className="flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-normal text-gray-800">
            {t("default")}
          </span>
        )}
        {app.isProOnly && user?.plan === "FREE" && (
          <span className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-sm font-normal text-orange-800">
            <Icon.FiStar className="h-4 w-4 text-orange-800" />
            {t("pro")}
          </span>
        )}
      </div>
    </div>
  );
}
