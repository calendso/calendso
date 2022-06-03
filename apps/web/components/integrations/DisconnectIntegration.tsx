import { useState } from "react";
import { useMutation } from "react-query";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { ButtonBaseProps } from "@calcom/ui/Button";
import { Dialog } from "@calcom/ui/Dialog";

import ConfirmationDialogContent from "@components/dialog/ConfirmationDialogContent";

export default function DisconnectIntegration(props: {
  /** Integration credential id */
  id: number;
  render: (renderProps: ButtonBaseProps) => JSX.Element;
  onOpenChange: (isOpen: boolean) => unknown | Promise<unknown>;
}) {
  const { t } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const mutation = useMutation(
    async () => {
      const res = await fetch("/api/integrations", {
        method: "DELETE",
        body: JSON.stringify({ id: props.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Something went wrong");
      }
      return res.json();
    },
    {
      async onSettled() {
        await props.onOpenChange(modalOpen);
      },
      onSuccess(data) {
        showToast(data.message, "success");
        setModalOpen(false);
      },
    }
  );
  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <ConfirmationDialogContent
          variety="danger"
          title={t("remove_app")}
          confirmBtnText={t("yes_remove_app")}
          cancelBtnText="Cancel"
          onConfirm={() => {
            mutation.mutate();
          }}>
          {t("are_you_sure_you_want_to_remove_this_app")}
        </ConfirmationDialogContent>
      </Dialog>
      {props.render({
        onClick() {
          setModalOpen(true);
        },
        disabled: modalOpen,
        loading: mutation.isLoading,
      })}
    </>
  );
}
