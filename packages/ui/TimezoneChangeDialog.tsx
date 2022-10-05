import { useState, useEffect } from "react";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { DialogContent, showToast } from "@calcom/ui/v2";
import { Dialog } from "@calcom/ui/v2/core/Dialog";

export default function TimezoneChangeDialog() {
  const { t } = useLocale();
  const { data: user, isLoading } = trpc.useQuery(["viewer.me"]);
  const utils = trpc.useContext();
  const userTz = user?.timeZone;
  const currentTz = dayjs.tz.guess();
  const closeCookie = !document.cookie.includes("calcom-timezone-dialog=1");
  const formattedCurrentTz = currentTz?.replace("_", " ");

  console.log("dialog");

  // update user settings
  const onSuccessMutation = async () => {
    showToast(t("updated_timezone_to", { formattedCurrentTz }), "success");
    await utils.invalidateQueries(["viewer.me"]);
  };

  const onErrorMutation = () => {
    showToast(t("couldnt_update_timezone"), "error");
  };

  // update timezone in db
  const mutation = trpc.useMutation("viewer.updateProfile", {
    onSuccess: onSuccessMutation,
    onError: onErrorMutation,
  });

  function updateTimezone() {
    setOpen(false);
    mutation.mutate({
      timeZone: currentTz,
    });
  }

  // check for difference in user timezone and current browser timezone
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tzDifferent = !isLoading && currentTz !== userTz;
    const showDialog = tzDifferent && closeCookie;
    setOpen(showDialog);
  }, [closeCookie, currentTz, isLoading, userTz]);

  // save cookie to not show again
  function onCancel() {
    setOpen(false);
    document.cookie = "calcom-timezone-dialog=1;max-age=7776000"; // 3 months expire
    showToast(t("we_wont_show_again"), "success");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        title={t("update_timezone_question")}
        description={t("update_timezone_description", { formattedCurrentTz })}
        type="creation"
        actionText={t("update_timezone")}
        actionOnClick={() => updateTimezone()}
        closeText={t("dont_update")}
        onInteractOutside={() => onCancel()}
        actionOnClose={() => onCancel()}>
        {/* todo: save this in db and auto-update when timezone changes (be able to disable??? if yes, /settings) 
        <Checkbox description="Always update timezone" />
        */}
      </DialogContent>
    </Dialog>
  );
}
