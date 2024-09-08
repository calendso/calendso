import { keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import classNames from "classnames";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useMemo, useRef, useReducer, useState, useEffect, useCallback } from "react";

import { getUserAvatarUrl } from "@calcom/lib/getAvatarUrl";
import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { AppCategories } from "@calcom/prisma/enums";
import { MembershipRole } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc";
import type { RouterOutputs } from "@calcom/trpc/react";
import { Avatar, Badge, Checkbox, DataTable } from "@calcom/ui";
import {
  Button,
  ButtonGroup,
  ConfirmationDialogContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  showToast,
  Tooltip,
} from "@calcom/ui";

import { MemberInvitationModalWithoutMembers } from "../components/MemberInvitationModal";
import DeleteBulkTeamMembers from "./DeleteBulkTeamMembers";
import { EditMemberSheet } from "./EditMemberSheet";
import InviteLinkSettingsModal from "./InviteLinkSettingsModal";
import TeamAvailabilityModal from "./TeamAvailabilityModal";

interface Props {
  team: NonNullable<RouterOutputs["viewer"]["teams"]["getMinimal"]>;
  isOrgAdminOrOwner: boolean | undefined;
}

export type User = RouterOutputs["viewer"]["teams"]["lazyLoadMembers"]["members"][number];

export type ConnectedAppsType = {
  name: string | null;
  logo: string | null;
  externalId: string | null;
  app: { slug: string; categories: AppCategories[] } | null;
};

const checkIsOrg = (team: Props["team"]) => {
  return team.isOrganization;
};

type Payload = {
  showModal: boolean;
  user?: User;
};

export type State = {
  deleteMember: Payload;
  impersonateMember: Payload;
  inviteMember: Payload;
  editSheet: Payload;
  teamAvailability: Payload;
  inviteLinkSetting: Payload;
};

export type Action =
  | {
      type:
        | "SET_DELETE_ID"
        | "SET_IMPERSONATE_ID"
        | "INVITE_MEMBER"
        | "EDIT_USER_SHEET"
        | "TEAM_AVAILABILITY"
        | "INVITE_LINK_SETTING";
      payload: Payload;
    }
  | {
      type: "CLOSE_MODAL";
    };

const initialState: State = {
  deleteMember: {
    showModal: false,
  },
  impersonateMember: {
    showModal: false,
  },
  inviteMember: {
    showModal: false,
  },
  editSheet: {
    showModal: false,
  },
  teamAvailability: {
    showModal: false,
  },
  inviteLinkSetting: {
    showModal: false,
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DELETE_ID":
      return { ...state, deleteMember: action.payload };
    case "SET_IMPERSONATE_ID":
      return { ...state, impersonateMember: action.payload };
    case "INVITE_MEMBER":
      return { ...state, inviteMember: action.payload };
    case "EDIT_USER_SHEET":
      return { ...state, editSheet: action.payload };
    case "INVITE_LINK_SETTING":
      return { ...state, inviteLinkSetting: action.payload };
    case "TEAM_AVAILABILITY":
      return { ...state, teamAvailability: action.payload };
    case "CLOSE_MODAL":
      return {
        ...state,
        deleteMember: { showModal: false },
        impersonateMember: { showModal: false },
        inviteMember: { showModal: false },
        editSheet: { showModal: false },
        teamAvailability: { showModal: false },
        inviteLinkSetting: { showModal: false },
      };
    default:
      return state;
  }
}

export default function MemberListItem(props: Props) {
  const { t, i18n } = useLocale();
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const [state, dispatch] = useReducer(reducer, initialState);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [connectedApps, setConnectedApps] = useState<Record<number, ConnectedAppsType[]>>({});
  const [userIds, setUserIds] = useState<number[]>([]);

  const { data: getUserConnectedApps } = trpc.viewer.teams.getUserConnectedApps.useQuery(
    { userIds, teamId: props.team.id },
    { enabled: !!userIds.length }
  );

  const { data, isPending, fetchNextPage, isFetching } = trpc.viewer.teams.lazyLoadMembers.useInfiniteQuery(
    {
      limit: 10,
      searchTerm: debouncedSearchTerm,
      teamId: props.team.id,
    },
    {
      enabled: !!props.team.id,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
    }
  );

  // To defer fetching Connected Apps
  useEffect(() => {
    if (data?.pages) {
      const userIds = data.pages[data.pages.length - 1].members.map((member) => member.id);
      setUserIds(userIds);
    }
  }, [data]);

  useEffect(() => {
    if (getUserConnectedApps) {
      setConnectedApps((prev) => ({ ...prev, ...getUserConnectedApps }));
    }
  }, [getUserConnectedApps]);

  const removeMemberFromCache = ({
    utils,
    memberId,
    teamId,
    searchTerm,
  }: {
    utils: ReturnType<typeof trpc.useUtils>;
    memberId: number;
    teamId: number;
    searchTerm: string;
  }) => {
    utils.viewer.teams.lazyLoadMembers.setInfiniteData(
      {
        limit: 10,
        teamId,
        searchTerm,
      },
      (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            members: page.members.filter((member) => member.id !== memberId),
          })),
        };
      }
    );
  };

  const removeMemberMutation = trpc.viewer.teams.removeMember.useMutation({
    onMutate: async ({ teamIds }) => {
      await utils.viewer.teams.lazyLoadMembers.cancel();
      const previousValue = utils.viewer.teams.lazyLoadMembers.getInfiniteData({
        limit: 10,
        teamId: teamIds[0],
        searchTerm: searchTerm,
      });

      if (previousValue) {
        removeMemberFromCache({
          utils,
          memberId: state.deleteMember.user?.id as number,
          teamId: teamIds[0],
          searchTerm: searchTerm,
        });
      }
      return { previousValue };
    },
    async onSuccess() {
      await utils.viewer.teams.get.invalidate();
      await utils.viewer.eventTypes.invalidate();
      await utils.viewer.organizations.listMembers.invalidate();
      await utils.viewer.organizations.getMembers.invalidate();
      showToast(t("success"), "success");
    },
    async onError(err) {
      showToast(err.message, "error");
    },
  });

  const resendInvitationMutation = trpc.viewer.teams.resendInvitation.useMutation({
    onSuccess: () => {
      showToast(t("invitation_resent"), "success");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  // const ownersInTeam = () => {
  //   const { members } = props.team;
  //   const owners = members.filter((member) => member["role"] === MembershipRole.OWNER && member["accepted"]);
  //   return owners.length;
  // };

  const isAdminOrOwner =
    props.team.membership.role === MembershipRole.OWNER ||
    props.team.membership.role === MembershipRole.ADMIN;

  const removeMember = () =>
    removeMemberMutation.mutate({
      teamIds: [props.team?.id],
      memberIds: [state.deleteMember.user?.id as number],
      isOrg: checkIsOrg(props.team),
    });

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;

  const memorisedColumns = useMemo(() => {
    const cols: ColumnDef<User>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
      },
      {
        id: "member",
        accessorFn: (data) => data.email,
        header: `Member (${totalDBRowCount})`,
        cell: ({ row }) => {
          const { username, email, avatarUrl, accepted, name } = row.original;
          const memberName =
            name ||
            (() => {
              const emailName = email.split("@")[0];
              return emailName.charAt(0).toUpperCase() + emailName.slice(1);
            })();
          return (
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                alt={username || email}
                imageSrc={getUserAvatarUrl({
                  avatarUrl,
                })}
              />
              <div data-testid={`member-${username}`}>
                <div data-testid="member-name" className="text-emphasis text-sm font-medium leading-none">
                  {memberName}
                </div>
                <div
                  data-testid={accepted ? "member-email" : `email-${email.replace("@", "")}-pending`}
                  className="text-subtle mt-1 text-sm leading-none">
                  {email}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (rows, id, filterValue) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Weird typing issue
          return rows.getValue(id).includes(filterValue);
        },
      },
      {
        id: "role",
        accessorFn: (data) => data.role,
        header: "Role",
        cell: ({ row, table }) => {
          const { role, accepted } = row.original;
          return (
            <div className="flex h-full flex-wrap items-center gap-2">
              {!accepted && (
                <Badge
                  data-testid="member-pending"
                  variant="orange"
                  className="text-xs"
                  onClick={() => {
                    table.getColumn("role")?.setFilterValue(["PENDING"]);
                  }}>
                  Pending
                </Badge>
              )}
              <Badge
                data-testid="member-role"
                variant={role === "MEMBER" ? "gray" : "blue"}
                onClick={() => {
                  table.getColumn("role")?.setFilterValue([role]);
                }}>
                {role}
              </Badge>
            </div>
          );
        },
        filterFn: (rows, id, filterValue) => {
          if (filterValue.includes("PENDING")) {
            if (filterValue.length === 1) return !rows.original.accepted;
            else return !rows.original.accepted || filterValue.includes(rows.getValue(id));
          }

          // Show only the selected roles
          return filterValue.includes(rows.getValue(id));
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          const isSelf = user.id === session?.user.id;
          const editMode =
            (props.team.membership?.role === MembershipRole.OWNER &&
              (user.role !== MembershipRole.OWNER || !isSelf)) ||
            (props.team.membership?.role === MembershipRole.ADMIN && user.role !== MembershipRole.OWNER) ||
            props.isOrgAdminOrOwner;
          const impersonationMode =
            editMode &&
            !user.disableImpersonation &&
            user.accepted &&
            process.env.NEXT_PUBLIC_TEAM_IMPERSONATION === "true";
          const resendInvitation = editMode && !user.accepted;
          return (
            <>
              {props.team.membership?.accepted && (
                <div className="flex items-center justify-end">
                  <ButtonGroup combined containerProps={{ className: "border-default hidden md:flex" }}>
                    {/* TODO: bring availability back. right now its ugly and broken
                    <Tooltip
                      content={
                        user.accepted
                          ? t("team_view_user_availability")
                          : t("team_view_user_availability_disabled")
                      }>
                      <Button
                        disabled={!user.accepted}
                        onClick={() =>
                          user.accepted
                            ? dispatch({
                                type: "TEAM_AVAILABILITY",
                                payload: {
                                  user,
                                  showModal: true,
                                },
                              })
                            : null
                        }
                        color="secondary"
                        variant="icon"
                        StartIcon="clock"
                      />
                    </Tooltip> */}
                    {!!user.accepted && (
                      <Tooltip content={t("view_public_page")}>
                        <Button
                          target="_blank"
                          href={`${user.bookerUrl}/${user.username}`}
                          color="secondary"
                          className={classNames(!editMode ? "rounded-r-md" : "")}
                          variant="icon"
                          StartIcon="external-link"
                          disabled={!user.accepted}
                        />
                      </Tooltip>
                    )}
                    {editMode && (
                      <Dropdown>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="radix-state-open:rounded-r-md"
                            color="secondary"
                            variant="icon"
                            StartIcon="ellipsis"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <DropdownItem
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "EDIT_USER_SHEET",
                                  payload: {
                                    user,
                                    showModal: true,
                                  },
                                })
                              }
                              StartIcon="pencil">
                              {t("edit")}
                            </DropdownItem>
                          </DropdownMenuItem>
                          {impersonationMode && (
                            <>
                              <DropdownMenuItem>
                                <DropdownItem
                                  type="button"
                                  onClick={() =>
                                    dispatch({
                                      type: "SET_IMPERSONATE_ID",
                                      payload: {
                                        user,
                                        showModal: true,
                                      },
                                    })
                                  }
                                  StartIcon="lock">
                                  {t("impersonate")}
                                </DropdownItem>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {resendInvitation && (
                            <DropdownMenuItem>
                              <DropdownItem
                                type="button"
                                onClick={() => {
                                  resendInvitationMutation.mutate({
                                    teamId: props.team?.id,
                                    email: user.email,
                                    language: i18n.language,
                                  });
                                }}
                                StartIcon="send">
                                {t("resend_invitation")}
                              </DropdownItem>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <DropdownItem
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "SET_DELETE_ID",
                                  payload: {
                                    user,
                                    showModal: true,
                                  },
                                })
                              }
                              color="destructive"
                              StartIcon="user-x">
                              {t("remove")}
                            </DropdownItem>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </Dropdown>
                    )}
                  </ButtonGroup>
                  <div className="flex md:hidden">
                    <Dropdown>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="icon" color="minimal" StartIcon="ellipsis" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="outline-none">
                          <DropdownItem
                            disabled={!user.accepted}
                            href={!user.accepted ? undefined : `/${user.username}`}
                            target="_blank"
                            type="button"
                            StartIcon="external-link">
                            {t("view_public_page")}
                          </DropdownItem>
                        </DropdownMenuItem>
                        {editMode && (
                          <>
                            <DropdownMenuItem>
                              <DropdownItem
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: "EDIT_USER_SHEET",
                                    payload: {
                                      user,
                                      showModal: true,
                                    },
                                  })
                                }
                                StartIcon="pencil">
                                {t("edit")}
                              </DropdownItem>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DropdownItem
                                type="button"
                                color="destructive"
                                onClick={() =>
                                  dispatch({
                                    type: "SET_DELETE_ID",
                                    payload: {
                                      user,
                                      showModal: true,
                                    },
                                  })
                                }
                                StartIcon="user-x">
                                {t("remove")}
                              </DropdownItem>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </Dropdown>
                  </div>
                </div>
              )}
            </>
          );
        },
      },
    ];

    return cols;
  }, [props.isOrgAdminOrOwner, dispatch, totalDBRowCount, session?.user.id]);

  const flatData = useMemo(() => data?.pages?.flatMap((page) => page.members) ?? [], [data]) as User[];
  const totalFetched = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (scrollHeight - scrollTop - clientHeight < 300 && !isFetching && totalFetched < totalDBRowCount) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return (
    <div className="mb-6">
      <DataTable
        data-testid="team-member-list-container"
        onSearch={(value) => setSearchTerm(value)}
        selectionOptions={[
          {
            type: "render",
            render: (table) => (
              <DeleteBulkTeamMembers
                users={table.getSelectedRowModel().flatRows.map((row) => row.original)}
                onRemove={() => table.toggleAllPageRowsSelected(false)}
                isOrg={checkIsOrg(props.team)}
                teamId={props.team.id}
              />
            ),
          },
        ]}
        tableContainerRef={tableContainerRef}
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
        tableCTA={
          isAdminOrOwner || props.isOrgAdminOrOwner ? (
            <Button
              type="button"
              color="primary"
              StartIcon="plus"
              size="sm"
              className="rounded-md"
              onClick={() =>
                dispatch({
                  type: "INVITE_MEMBER",
                  payload: {
                    showModal: true,
                  },
                })
              }
              data-testid="new-member-button">
              {t("add")}
            </Button>
          ) : (
            <></>
          )
        }
        columns={memorisedColumns}
        data={flatData}
        isPending={isPending}
        filterableItems={[
          {
            tableAccessor: "role",
            title: "Role",
            options: [
              { label: "Owner", value: "OWNER" },
              { label: "Admin", value: "ADMIN" },
              { label: "Member", value: "MEMBER" },
              { label: "Pending", value: "PENDING" },
            ],
          },
        ]}
      />

      {state.deleteMember.showModal && (
        <Dialog
          open={true}
          onOpenChange={(open) =>
            !open &&
            dispatch({
              type: "CLOSE_MODAL",
            })
          }>
          <ConfirmationDialogContent
            variety="danger"
            title={t("remove_member")}
            confirmBtnText={t("confirm_remove_member")}
            onConfirm={removeMember}>
            {t("remove_member_confirmation_message")}
          </ConfirmationDialogContent>
        </Dialog>
      )}

      {state.impersonateMember.showModal && state.impersonateMember.user?.username && (
        <Dialog
          open={true}
          onOpenChange={() =>
            dispatch({
              type: "CLOSE_MODAL",
            })
          }>
          <DialogContent type="creation" title={t("impersonate")} description={t("impersonation_user_tip")}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await signIn("impersonation-auth", {
                  username: state.impersonateMember.user?.email,
                  teamId: props.team.id,
                });
                dispatch({
                  type: "CLOSE_MODAL",
                });
              }}>
              <DialogFooter showDivider className="mt-8">
                <DialogClose color="secondary">{t("cancel")}</DialogClose>
                <Button color="primary" type="submit">
                  {t("impersonate")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {state.inviteMember.showModal && (
        <MemberInvitationModalWithoutMembers
          teamId={props.team.id}
          token={props.team.inviteToken?.token}
          hideInvitationModal={() => {
            dispatch({
              type: "CLOSE_MODAL",
            });
          }}
          showMemberInvitationModal={true}
          onSettingsOpen={() => {
            dispatch({
              type: "INVITE_MEMBER",
              payload: {
                showModal: false,
              },
            });
            dispatch({
              type: "INVITE_LINK_SETTING",
              payload: {
                showModal: true,
              },
            });
          }}
        />
      )}
      {state.inviteLinkSetting.showModal && props.team.inviteToken && (
        <InviteLinkSettingsModal
          isOpen={true}
          teamId={props.team.id}
          token={props.team.inviteToken.token}
          expiresInDays={props.team.inviteToken.expiresInDays || undefined}
          onExit={() => {
            dispatch({
              type: "INVITE_MEMBER",
              payload: {
                showModal: true,
              },
            });
            dispatch({
              type: "INVITE_LINK_SETTING",
              payload: {
                showModal: false,
              },
            });
          }}
        />
      )}
      {state.teamAvailability.showModal && (
        <Dialog
          open={true}
          onOpenChange={() => {
            dispatch({
              type: "CLOSE_MODAL",
            });
          }}>
          <DialogContent type="creation" size="md">
            <TeamAvailabilityModal team={props.team} member={state.teamAvailability.user} />
          </DialogContent>
        </Dialog>
      )}
      {state.editSheet.showModal && (
        <EditMemberSheet
          dispatch={dispatch}
          state={state}
          connectedApps={connectedApps[state.editSheet?.user?.id || 0] ?? []}
          currentMember={props.team.membership.role}
          teamId={props.team.id}
        />
      )}
    </div>
  );
}
