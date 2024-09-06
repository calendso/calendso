import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { shallow } from "zustand/shallow";

import { DisplayInfo } from "@calcom/features/users/components/UserTable/EditSheet/DisplayInfo";
import { OrganizationBanner } from "@calcom/features/users/components/UserTable/EditSheet/OrganizationBanner";
import { SheetFooterControls } from "@calcom/features/users/components/UserTable/EditSheet/SheetFooterControls";
import { useEditMode } from "@calcom/features/users/components/UserTable/EditSheet/store";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { MembershipRole } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";
import {
  Avatar,
  Icon,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetBody,
  Skeleton,
  Tooltip,
  ToggleGroup,
  Form,
  showToast,
} from "@calcom/ui";

import { updateRoleInCache } from "./MemberChangeRoleModal";
import type { Action, ConnectedAppsType, State, User } from "./MemberListItem";

const formSchema = z.object({
  role: z.enum([MembershipRole.MEMBER, MembershipRole.ADMIN, MembershipRole.OWNER]),
});

type FormSchema = z.infer<typeof formSchema>;

export function EditMemberSheet({
  state,
  dispatch,
  connectedApps,
  currentMember,
  teamId,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  connectedApps: ConnectedAppsType[];
  currentMember: MembershipRole;
  teamId: number;
}) {
  const { t } = useLocale();
  const { user } = state.editSheet;
  const selectedUser = user as User;
  const [editMode, setEditMode] = useEditMode((state) => [state.editMode, state.setEditMode], shallow);
  const name =
    selectedUser.name ||
    (() => {
      const emailName = selectedUser.email.split("@")[0] as string;
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    })();

  const bookerUrl = selectedUser.bookerUrl;
  const utils = trpc.useUtils();
  const bookerUrlWithoutProtocol = bookerUrl.replace(/^https?:\/\//, "");
  const bookingLink = !!selectedUser.username ? `${bookerUrlWithoutProtocol}/${selectedUser.username}` : "";

  const options = useMemo(() => {
    return [
      {
        label: t("member"),
        value: MembershipRole.MEMBER,
      },
      {
        label: t("admin"),
        value: MembershipRole.ADMIN,
      },
      {
        label: t("owner"),
        value: MembershipRole.OWNER,
      },
    ].filter(({ value }) => value !== MembershipRole.OWNER || currentMember === MembershipRole.OWNER);
  }, [t, currentMember]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: selectedUser.role,
    },
  });

  const changeRoleMutation = trpc.viewer.teams.changeMemberRole.useMutation({
    onMutate: async ({ teamId, memberId, role }) => {
      await utils.viewer.teams.lazyLoadMembers.cancel();
      const previousValue = utils.viewer.teams.lazyLoadMembers.getInfiniteData({
        limit: 10,
        teamId: teamId,
        searchTerm: undefined,
      });

      if (previousValue) {
        updateRoleInCache({ utils, teamId, memberId, role, searchTerm: undefined });
      }

      return { previousValue };
    },
    async onSuccess() {
      await utils.viewer.teams.get.invalidate();
      await utils.viewer.organizations.listMembers.invalidate();
      showToast(t("profile_updated_successfully"), "success");
      setEditMode(false);
    },
    async onError(err) {
      showToast(err.message, "error");
    },
  });

  function changeRole(values: FormSchema) {
    changeRoleMutation.mutate({
      teamId: teamId,
      memberId: user?.id as number,
      role: values.role,
    });
  }

  const appList = connectedApps?.map(({ logo, name, externalId }) => {
    return logo ? (
      externalId ? (
        <div className="ltr:mr-2 rtl:ml-2 ">
          <Tooltip content={externalId}>
            <img className="h-5 w-5" src={logo} alt={`${name} logo`} />
          </Tooltip>
        </div>
      ) : (
        <div className="ltr:mr-2 rtl:ml-2">
          <img className="h-5 w-5" src={logo} alt={`${name} logo`} />
        </div>
      )
    ) : null;
  });

  return (
    <Sheet
      open={true}
      onOpenChange={() => {
        setEditMode(false);
        dispatch({ type: "CLOSE_MODAL" });
      }}>
      <SheetContent className="bg-muted">
        <Form form={form} handleSubmit={changeRole} className="flex h-full flex-col">
          <SheetHeader showCloseButton={false} className="w-full">
            <div className="border-sublte bg-default w-full rounded-xl border p-4">
              <OrganizationBanner />
              <div className="bg-default ml-3 w-fit translate-y-[-50%] rounded-full p-1 ring-1 ring-[#0000000F]">
                <Avatar asChild size="lg" alt={`${name} avatar`} imageSrc={selectedUser.avatarUrl} />
              </div>
              <Skeleton as="p" waitForTranslation={false}>
                <h2 className="text-emphasis font-sans text-2xl font-semibold">{name || "Nameless User"}</h2>
              </Skeleton>
              <Skeleton as="p" waitForTranslation={false}>
                <p className="text-subtle max-h-[3em] overflow-hidden text-ellipsis text-sm font-normal">
                  {selectedUser.bio ? selectedUser?.bio : t("user_has_no_bio")}
                </p>
              </Skeleton>
            </div>
          </SheetHeader>
          <SheetBody className="flex flex-col space-y-4 p-4">
            <div className="mb-4 flex flex-col space-y-4">
              <h3 className="text-emphasis mb-1 text-base font-semibold">{t("profile")}</h3>
              <DisplayInfo label="Cal" value={bookingLink} icon="external-link" />
              <DisplayInfo label={t("email")} value={selectedUser.email} icon="at-sign" />
              {!editMode ? (
                <DisplayInfo label={t("role")} value={[selectedUser.role]} icon="fingerprint" />
              ) : (
                <div className="flex items-center gap-6">
                  <div className="flex w-[110px] items-center gap-2">
                    <Icon className="h-4 w-4" name="fingerprint" />
                    <label className="text-sm font-medium">{t("role")}</label>
                  </div>
                  <div className="flex flex-1">
                    <ToggleGroup
                      isFullWidth
                      defaultValue={selectedUser.role}
                      value={form.watch("role")}
                      options={options}
                      onValueChange={(value: FormSchema["role"]) => {
                        form.setValue("role", value);
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-6">
                <div className="flex w-[110px] items-center gap-2">
                  <Icon className="text-subtle h-4 w-4" name="grid-3x3" />
                  <label className="text-subtle text-sm font-medium">{t("apps")}</label>
                </div>
                <div className="flex flex-1">
                  {connectedApps?.length === 0 ? (
                    <div>{t("user_has_no_app_installed")}</div>
                  ) : (
                    <div className="flex">{appList}</div>
                  )}
                </div>
              </div>
            </div>
          </SheetBody>
          <SheetFooter className="mt-auto">
            <SheetFooterControls />
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
