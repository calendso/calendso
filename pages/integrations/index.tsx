import {
  PencilAltIcon,
  SwitchHorizontalIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import { ClipboardIcon } from "@heroicons/react/solid";
import { WebhookTriggerEvents } from "@prisma/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import Image from "next/image";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation } from "react-query";

import { QueryCell } from "@lib/QueryCell";
import classNames from "@lib/classNames";
import * as fetcher from "@lib/core/http/fetch-wrapper";
import { getErrorFromUnknown } from "@lib/errors";
import { useLocale } from "@lib/hooks/useLocale";
import showToast from "@lib/notification";
import { inferQueryOutput, trpc } from "@lib/trpc";

import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@components/Dialog";
import { List, ListItem, ListItemText, ListItemTitle } from "@components/List";
import Shell, { ShellSubHeading } from "@components/Shell";
import { Tooltip } from "@components/Tooltip";
import ConfirmationDialogContent from "@components/dialog/ConfirmationDialogContent";
import { FieldsetLegend, Form, InputGroupBox, TextField } from "@components/form/fields";
import CalendarsList from "@components/integrations/CalendarsList";
import ConnectIntegration from "@components/integrations/ConnectIntegrations";
import ConnectedCalendarsList from "@components/integrations/ConnectedCalendarsList";
import DisconnectIntegration from "@components/integrations/DisconnectIntegration";
import IntegrationListItem from "@components/integrations/IntegrationListItem";
import SubHeadingTitleWithConnections from "@components/integrations/SubHeadingTitleWithConnections";
import { Alert } from "@components/ui/Alert";
import Button from "@components/ui/Button";
import Switch from "@components/ui/Switch";

type TIntegrations = inferQueryOutput<"viewer.integrations">;
type TWebhook = TIntegrations["webhooks"][number];

const ALL_TRIGGERS: WebhookTriggerEvents[] = [
  //
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
];
function WebhookListItem(props: { webhook: TWebhook; onEditWebhook: () => void }) {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const deleteWebhook = useMutation(async () => fetcher.remove(`/api/webhooks/${props.webhook.id}`, null), {
    async onSuccess() {
      await utils.invalidateQueries(["viewer.integrations"]);
    },
  });

  return (
    <ListItem className="flex w-full p-4">
      <div className="flex justify-between w-full">
        <div className="flex flex-col">
          <div className="inline-block space-y-1">
            <span
              className={classNames(
                "flex text-sm ",
                props.webhook.active ? "text-neutral-700" : "text-neutral-200"
              )}>
              {props.webhook.subscriberUrl}
            </span>
          </div>
          <div className="flex mt-2">
            <span className="flex space-x-2 text-xs">
              {props.webhook.eventTriggers.map((eventTrigger, ind) => (
                <span
                  key={ind}
                  className={classNames(
                    "px-1 text-xs rounded-sm w-max ",
                    props.webhook.active ? "text-blue-700 bg-blue-100" : "text-blue-200 bg-blue-50"
                  )}>
                  {t(`${eventTrigger.toLowerCase()}`)}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="flex">
          <Tooltip content={t("edit_webhook")}>
            <Button
              onClick={() => props.onEditWebhook()}
              color="minimal"
              size="icon"
              StartIcon={PencilAltIcon}
              className="self-center w-full p-2 ml-4"></Button>
          </Tooltip>
          <Dialog>
            <Tooltip content={t("delete_webhook")}>
              <DialogTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  color="minimal"
                  size="icon"
                  StartIcon={TrashIcon}
                  className="self-center w-full p-2 ml-2"></Button>
              </DialogTrigger>
            </Tooltip>
            <ConfirmationDialogContent
              variety="danger"
              title={t("delete_webhook")}
              confirmBtnText={t("confirm_delete_webhook")}
              cancelBtnText={t("cancel")}
              onConfirm={() => deleteWebhook.mutate()}>
              {t("delete_webhook_confirmation_message")}
            </ConfirmationDialogContent>
          </Dialog>
        </div>
      </div>
    </ListItem>
  );
}

function WebhookTestDisclosure() {
  const subscriberUrl: string = useWatch({ name: "subscriberUrl" });
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const mutation = trpc.useMutation("viewer.webhook.testTrigger", {
    onError(err) {
      showToast(err.message, "error");
    },
  });

  return (
    <Collapsible open={open} onOpenChange={() => setOpen(!open)}>
      <CollapsibleTrigger type="button" className={"cursor-pointer flex w-full text-sm"}>
        {t("webhook_test")}{" "}
        {open ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-700" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-700" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <InputGroupBox className="px-0 space-y-0 border-0">
          <div className="flex justify-between p-2 bg-gray-50">
            <h3 className="self-center text-gray-700">{t("webhook_response")}</h3>
            <Button
              StartIcon={SwitchHorizontalIcon}
              type="button"
              color="minimal"
              disabled={mutation.isLoading}
              onClick={() => mutation.mutate({ url: subscriberUrl, type: "PING" })}>
              {t("ping_test")}
            </Button>
          </div>
          <div className="p-2 text-gray-500 border-8 border-gray-50">
            {!mutation.data && <em>{t("no_data_yet")}</em>}
            {mutation.status === "success" && (
              <>
                <div
                  className={classNames(
                    "px-2 py-1 w-max text-xs ml-auto",
                    mutation.data.status === 200 ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"
                  )}>
                  {mutation.data.status === 200 ? t("success") : t("failed")}
                </div>
                <pre className="overflow-x-auto">{JSON.stringify(mutation.data, null, 4)}</pre>
              </>
            )}
          </div>
        </InputGroupBox>
      </CollapsibleContent>
    </Collapsible>
  );
}

function WebhookDialogForm(props: {
  //
  defaultValues?: TWebhook;
  handleClose: () => void;
}) {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const {
    defaultValues = {
      id: "",
      eventTriggers: ALL_TRIGGERS,
      subscriberUrl: "",
      active: true,
    },
  } = props;

  const form = useForm({
    defaultValues,
  });

  return (
    <Form
      data-testid="WebhookDialogForm"
      form={form}
      onSubmit={(event) => {
        form
          .handleSubmit(async (values) => {
            const { id } = values;
            const body = {
              subscriberUrl: values.subscriberUrl,
              enabled: values.active,
              eventTriggers: values.eventTriggers,
            };
            if (id) {
              await fetcher.patch(`/api/webhooks/${id}`, body);
              await utils.invalidateQueries(["viewer.integrations"]);
              showToast(t("webhook_updated_successfully"), "success");
            } else {
              await fetcher.post("/api/webhook", body);
              await utils.invalidateQueries(["viewer.integrations"]);
              showToast(t("webhook_created_successfully"), "success");
            }

            props.handleClose();
          })(event)
          .catch((err) => {
            showToast(`${getErrorFromUnknown(err).message}`, "error");
          });
      }}
      className="space-y-4">
      <input type="hidden" {...form.register("id")} />
      <fieldset className="space-y-2">
        <InputGroupBox className="border-0 bg-gray-50">
          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <Switch
                label={field.value ? t("webhook_enabled") : t("webhook_disabled")}
                defaultChecked={field.value}
                onCheckedChange={(isChecked) => {
                  form.setValue("active", isChecked);
                }}
              />
            )}
          />
        </InputGroupBox>
      </fieldset>
      <TextField label={t("subscriber_url")} {...form.register("subscriberUrl")} required type="url" />

      <fieldset className="space-y-2">
        <FieldsetLegend>{t("event_triggers")}</FieldsetLegend>
        <InputGroupBox className="border-0 bg-gray-50">
          {ALL_TRIGGERS.map((key) => (
            <Controller
              key={key}
              control={form.control}
              name="eventTriggers"
              render={({ field }) => (
                <Switch
                  label={t(key.toLowerCase())}
                  defaultChecked={field.value.includes(key)}
                  onCheckedChange={(isChecked) => {
                    const value = field.value;
                    const newValue = isChecked ? [...value, key] : value.filter((v) => v !== key);

                    form.setValue("eventTriggers", newValue, {
                      shouldDirty: true,
                    });
                  }}
                />
              )}
            />
          ))}
        </InputGroupBox>
      </fieldset>
      <WebhookTestDisclosure />
      <DialogFooter>
        <Button type="button" color="secondary" onClick={props.handleClose} tabIndex={-1}>
          {t("cancel")}
        </Button>
        <Button type="submit" loading={form.formState.isSubmitting}>
          {t("save")}
        </Button>
      </DialogFooter>
    </Form>
  );
}

function WebhookEmbed(props: { webhooks: TWebhook[] }) {
  const { t } = useLocale();
  const user = trpc.useQuery(["viewer.me"]).data;

  const iframeTemplate = `<iframe src="${process.env.NEXT_PUBLIC_BASE_URL}/${user?.username}" frameborder="0" allowfullscreen></iframe>`;
  const htmlTemplate = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t(
    "schedule_a_meeting"
  )}</title><style>body {margin: 0;}iframe {height: calc(100vh - 4px);width: calc(100vw - 4px);box-sizing: border-box;}</style></head><body>${iframeTemplate}</body></html>`;

  const [newWebhookModal, setNewWebhookModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<TWebhook | null>(null);
  return (
    <>
      <ShellSubHeading className="mt-10" title={t("Webhooks")} subtitle={t("receive_cal_meeting_data")} />
      <List>
        <ListItem className={classNames("flex-col")}>
          <div className={classNames("flex flex-1 space-x-2 w-full p-3 items-center")}>
            <Image width={40} height={40} src="/integrations/webhooks.svg" alt="Webhooks" />
            <div className="flex-grow pl-2 truncate">
              <ListItemTitle component="h3">Webhooks</ListItemTitle>
              <ListItemText component="p">Automation</ListItemText>
            </div>
            <div>
              <Button color="secondary" onClick={() => setNewWebhookModal(true)} data-testid="new_webhook">
                {t("new_webhook")}
              </Button>
            </div>
          </div>
        </ListItem>
      </List>

      {props.webhooks.length ? (
        <List>
          {props.webhooks.map((item) => (
            <WebhookListItem
              key={item.id}
              webhook={item}
              onEditWebhook={() => {
                setEditing(item);
                setEditModalOpen(true);
              }}
            />
          ))}
        </List>
      ) : null}
      <div className="divide-y divide-gray-200 lg:col-span-9">
        <div className="py-6 lg:pb-8">
          <div>
            {/* {!!props.webhooks.length && (
              <WebhookList
                webhooks={props.webhooks}
                onChange={() => {}}
                onEditWebhook={editWebhook}></WebhookList>
            )} */}
          </div>
        </div>
      </div>

      <ShellSubHeading title={t("iframe_embed")} subtitle={t("embed_calcom")} />
      <div className="lg:pb-8 lg:col-span-9">
        <List>
          <ListItem className={classNames("flex-col")}>
            <div className={classNames("flex flex-1 space-x-2 w-full p-3 items-center")}>
              <Image width={40} height={40} src="/integrations/embed.svg" alt="Embed" />
              <div className="flex-grow pl-2 truncate">
                <ListItemTitle component="h3">{t("standard_iframe")}</ListItemTitle>
                <ListItemText component="p">Embed your calendar within your webpage</ListItemText>
              </div>
              <div>
                <input
                  id="iframe"
                  className="px-2 py-1 text-sm text-gray-500 focus:ring-black focus:border-black"
                  placeholder={t("loading")}
                  defaultValue={iframeTemplate}
                  readOnly
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(iframeTemplate);
                    showToast("Copied to clipboard", "success");
                  }}>
                  <ClipboardIcon className="w-4 h-4 -mb-0.5 mr-2 text-gray-800" />
                </button>
              </div>
            </div>
          </ListItem>
          <ListItem className={classNames("flex-col")}>
            <div className={classNames("flex flex-1 space-x-2 w-full p-3 items-center")}>
              <Image width={40} height={40} src="/integrations/embed.svg" alt="Embed" />
              <div className="flex-grow pl-2 truncate">
                <ListItemTitle component="h3">{t("responsive_fullscreen_iframe")}</ListItemTitle>
                <ListItemText component="p">A fullscreen scheduling experience on your website</ListItemText>
              </div>
              <div>
                <input
                  id="fullscreen"
                  className="px-2 py-1 text-sm text-gray-500 focus:ring-black focus:border-black"
                  placeholder={t("loading")}
                  defaultValue={htmlTemplate}
                  readOnly
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(htmlTemplate);
                    showToast("Copied to clipboard", "success");
                  }}>
                  <ClipboardIcon className="w-4 h-4 -mb-0.5 mr-2 text-gray-800" />
                </button>
              </div>
            </div>
          </ListItem>
        </List>
        <div className="grid grid-cols-2 space-x-4">
          <div>
            <label htmlFor="iframe" className="block text-sm font-medium text-gray-700"></label>
            <div className="mt-1"></div>
          </div>
          <div>
            <label htmlFor="fullscreen" className="block text-sm font-medium text-gray-700"></label>
            <div className="mt-1"></div>
          </div>
        </div>

        <ShellSubHeading className="mt-10" title="Cal.com API" subtitle={t("leverage_our_api")} />
        <a href="https://developer.cal.com/api" className="btn btn-primary">
          {t("browse_api_documentation")}
        </a>
      </div>

      {/* New webhook dialog */}
      <Dialog open={newWebhookModal} onOpenChange={(isOpen) => !isOpen && setNewWebhookModal(false)}>
        <DialogContent>
          <WebhookDialogForm handleClose={() => setNewWebhookModal(false)} />
        </DialogContent>
      </Dialog>
      {/* Edit webhook dialog */}
      <Dialog open={editModalOpen} onOpenChange={(isOpen) => !isOpen && setEditModalOpen(false)}>
        <DialogContent>
          {editing && (
            <WebhookDialogForm
              key={editing.id}
              handleClose={() => setEditModalOpen(false)}
              defaultValues={editing}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConnectOrDisconnectIntegrationButton(props: {
  //
  credentialIds: number[];
  type: string;
  installed: boolean;
}) {
  const [credentialId] = props.credentialIds;
  const utils = trpc.useContext();
  const handleOpenChange = () => {
    utils.invalidateQueries(["viewer.integrations"]);
  };

  if (credentialId) {
    return (
      <DisconnectIntegration
        id={credentialId}
        render={(btnProps) => (
          <Button {...btnProps} color="warn">
            Disconnect
          </Button>
        )}
        onOpenChange={handleOpenChange}
      />
    );
  }
  if (!props.installed) {
    return (
      <div className="flex items-center truncate">
        <Alert severity="warning" title="Not installed" />
      </div>
    );
  }
  /** We don't need to "Connect", just show that it's installed */
  if (props.type === "daily_video") {
    return (
      <div className="px-3 py-2 truncate">
        <h3 className="text-sm font-medium text-gray-700">Installed</h3>
      </div>
    );
  }
  return (
    <ConnectIntegration
      type={props.type}
      render={(btnProps) => (
        <Button color="secondary" {...btnProps}>
          Connect
        </Button>
      )}
      onOpenChange={handleOpenChange}
    />
  );
}

export default function IntegrationsPage() {
  const query = trpc.useQuery(["viewer.integrations"]);
  const utils = trpc.useContext();
  const handleOpenChange = () => {
    utils.invalidateQueries(["viewer.integrations"]);
  };

  return (
    <Shell heading="Integrations" subtitle="Connect your favourite apps.">
      <QueryCell
        query={query}
        success={({ data }) => {
          return (
            <>
              <ShellSubHeading
                title={
                  <SubHeadingTitleWithConnections
                    title="Conferencing"
                    numConnections={data.conferencing.numActive}
                  />
                }
              />
              <List>
                {data.conferencing.items.map((item) => (
                  <IntegrationListItem
                    key={item.title}
                    {...item}
                    actions={<ConnectOrDisconnectIntegrationButton {...item} />}
                  />
                ))}
              </List>

              <ShellSubHeading
                className="mt-10"
                title={
                  <SubHeadingTitleWithConnections title="Payment" numConnections={data.payment.numActive} />
                }
              />
              <List>
                {data.payment.items.map((item) => (
                  <IntegrationListItem
                    key={item.title}
                    {...item}
                    actions={<ConnectOrDisconnectIntegrationButton {...item} />}
                  />
                ))}
              </List>

              <ShellSubHeading
                className="mt-10"
                title={
                  <SubHeadingTitleWithConnections
                    title="Calendars"
                    numConnections={data.calendar.numActive}
                  />
                }
                subtitle={
                  <>
                    Configure how your links integrate with your calendars.
                    <br />
                    You can override these settings on a per event basis.
                  </>
                }
              />

              {data.connectedCalendars.length > 0 && (
                <>
                  <ConnectedCalendarsList
                    connectedCalendars={data.connectedCalendars}
                    onChanged={handleOpenChange}
                  />
                  <ShellSubHeading
                    className="mt-6"
                    title={<SubHeadingTitleWithConnections title="Connect an additional calendar" />}
                  />
                </>
              )}
              <CalendarsList calendars={data.calendar.items} onChanged={handleOpenChange} />
              <WebhookEmbed webhooks={data.webhooks} />
            </>
          );
        }}
      />
    </Shell>
  );
}
