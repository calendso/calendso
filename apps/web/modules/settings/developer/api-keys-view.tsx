"use client";

import { useState, useTransition } from "react";

import type { TApiKeys } from "@calcom/ee/api-keys/components/ApiKeyListItem";
import LicenseRequired from "@calcom/ee/common/components/LicenseRequired";
import ApiKeyDialogForm from "@calcom/features/ee/api-keys/components/ApiKeyDialogForm";
import ApiKeyListItem from "@calcom/features/ee/api-keys/components/ApiKeyListItem";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { ApiKeysRepository } from "@calcom/lib/server/repository/apiKeys";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  Dialog,
  DialogContent,
  EmptyScreen,
  Meta,
  SkeletonContainer,
  SkeletonText,
} from "@calcom/ui";

const SkeletonLoader = ({ title, description }: { title: string; description: string }) => {
  return (
    <SkeletonContainer>
      <Meta title={title} description={description} borderInShellHeader={true} />
      <div className="divide-subtle border-subtle space-y-6 rounded-b-lg border border-t-0 px-6 py-4">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
      </div>
    </SkeletonContainer>
  );
};

interface ApiKeysViewProps {
  ssrProps?: {
    apiKeysList?: Awaited<ReturnType<typeof ApiKeysRepository.getApiKeys>>;
  };
  revalidateApiKeys?: () => Promise<void>;
}

export default function ApiKeysView({ ssrProps, revalidateApiKeys }: ApiKeysViewProps) {
  const { t } = useLocale();

  const [isPending, startTransition] = useTransition();

  const { data: apiKeysList, isPending: isPendingList } = trpc.viewer.apiKeys.list.useQuery(undefined, {
    enabled: !ssrProps?.apiKeysList,
  });
  const isPendingListOverride = ssrProps?.apiKeysList ? false : isPendingList;
  const data = ssrProps?.apiKeysList ?? apiKeysList;

  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [apiKeyToEdit, setApiKeyToEdit] = useState<(TApiKeys & { neverExpires?: boolean }) | undefined>(
    undefined
  );

  const NewApiKeyButton = () => {
    return (
      <Button
        color="secondary"
        StartIcon="plus"
        onClick={() => {
          setApiKeyToEdit(undefined);
          setApiKeyModal(true);
        }}>
        {t("add")}
      </Button>
    );
  };

  const handleRevalidate = () => {
    startTransition(() => {
      revalidateApiKeys?.();
    });
  };

  if (isPending || !data) {
    return (
      <SkeletonLoader
        title={t("api_keys")}
        description={t("create_first_api_key_description", { appName: APP_NAME })}
      />
    );
  }

  return (
    <>
      <LicenseRequired>
        <div>
          {data?.length ? (
            <>
              <div className="border-subtle rounded-b-lg border border-t-0">
                {data.map((apiKey, index) => (
                  <ApiKeyListItem
                    key={apiKey.id}
                    apiKey={apiKey}
                    lastItem={data.length === index + 1}
                    onEditClick={() => {
                      setApiKeyToEdit(apiKey);
                      setApiKeyModal(true);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyScreen
              Icon="link"
              headline={t("create_first_api_key")}
              description={t("create_first_api_key_description", { appName: APP_NAME })}
              className="rounded-b-lg rounded-t-none border-t-0"
              buttonRaw={<NewApiKeyButton />}
            />
          )}
        </div>
      </LicenseRequired>

      <Dialog open={apiKeyModal} onOpenChange={setApiKeyModal}>
        <DialogContent type="creation">
          <ApiKeyDialogForm
            handleClose={() => setApiKeyModal(false)}
            defaultValues={apiKeyToEdit}
            onSuccess={handleRevalidate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
