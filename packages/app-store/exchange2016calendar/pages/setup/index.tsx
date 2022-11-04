import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Form, TextField } from "@calcom/ui/components";
import { Alert } from "@calcom/ui/v2";

export default function Exchange2016CalendarSetup() {
  const { t } = useLocale();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      url: process.env.EXCHANGE_DEFAULT_EWS_URL || "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="m-auto rounded bg-white p-5 md:w-[560px] md:p-10">
        <div>
          <img
            src="/api/app-store/exchange2016calendar/icon.svg"
            alt="Exchange 2016 Calendar"
            className="h-12 w-12 max-w-2xl"
          />
        </div>
        <div className="flex w-10/12 flex-col">
          <h1 className="text-gray-600">{t("add_exchange2016")}</h1>
          <div className="mt-1 text-sm">{t("credentials_stored_encrypted")}</div>
          <div className="my-2 mt-3">
            <Form
              form={form}
              handleSubmit={async (values) => {
                setErrorMessage("");
                const res = await fetch("/api/integrations/exchange2016calendar/add", {
                  method: "POST",
                  body: JSON.stringify(values),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                const json = await res.json();
                if (!res.ok) {
                  setErrorMessage(json?.message || t("something_went_wrong"));
                } else {
                  router.push(json.url);
                }
              }}>
              <fieldset className="space-y-2" disabled={form.formState.isSubmitting}>
                <TextField
                  required
                  type="text"
                  {...form.register("url")}
                  label={t("calendar_url")}
                  placeholder="https://example.com/Ews/Exchange.asmx"
                />
                <TextField
                  required
                  type="text"
                  {...form.register("username")}
                  label="E-Mail"
                  placeholder="rickroll@example.com"
                />
                <TextField
                  required
                  type="password"
                  {...form.register("password")}
                  label="Password"
                  placeholder="•••••••••••••"
                  autoComplete="password"
                />
              </fieldset>

              {errorMessage && <Alert severity="error" title={errorMessage} className="my-4" />}
              <div className="mt-5 justify-end space-x-2 sm:mt-4 sm:flex">
                <Button type="button" color="secondary" onClick={() => router.back()}>
                  {t("cancel")}
                </Button>
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {t("save")}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
