import { keepPreviousData } from "@tanstack/react-query";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useReducer, useRef, useState } from "react";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { getUserAvatarUrl } from "@calcom/lib/getAvatarUrl";
import { useCopy } from "@calcom/lib/hooks/useCopy";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import {
  Avatar,
  Badge,
  Checkbox,
  DataTable,
  DataTableToolbar,
  DataTableFilters,
  DataTableSelectionBar,
} from "@calcom/ui";

import { useOrgBranding } from "../../../ee/organizations/context/provider";
import { DeleteBulkUsers } from "./BulkActions/DeleteBulkUsers";
import { EventTypesList } from "./BulkActions/EventTypesList";
import { MassAssignAttributesBulkAction } from "./BulkActions/MassAssignAttributes";
import { TeamListBulkAction } from "./BulkActions/TeamList";
import { ChangeUserRoleModal } from "./ChangeUserRoleModal";
import { DeleteMemberModal } from "./DeleteMemberModal";
import { EditUserSheet } from "./EditSheet/EditUserSheet";
import { ImpersonationMemberModal } from "./ImpersonationMemberModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { TableActions } from "./UserTableActions";
import type { UserTableState, UserTableAction, UserTableUser } from "./types";
import { useFetchMoreOnBottomReached } from "./useFetchMoreOnBottomReached";

const initialState: UserTableState = {
  changeMemberRole: {
    showModal: false,
  },
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
};

const initalColumnVisibility = {
  select: true,
  member: true,
  role: true,
  teams: true,
  actions: true,
};

function reducer(state: UserTableState, action: UserTableAction): UserTableState {
  switch (action.type) {
    case "SET_CHANGE_MEMBER_ROLE_ID":
      return { ...state, changeMemberRole: action.payload };
    case "SET_DELETE_ID":
      return { ...state, deleteMember: action.payload };
    case "SET_IMPERSONATE_ID":
      return { ...state, impersonateMember: action.payload };
    case "INVITE_MEMBER":
      return { ...state, inviteMember: action.payload };
    case "EDIT_USER_SHEET":
      return { ...state, editSheet: action.payload };
    case "CLOSE_MODAL":
      return {
        ...state,
        changeMemberRole: { showModal: false },
        deleteMember: { showModal: false },
        impersonateMember: { showModal: false },
        inviteMember: { showModal: false },
        editSheet: { showModal: false },
      };
    default:
      return state;
  }
}

export function UserListTable() {
  const { data: session } = useSession();
  const { t } = useLocale();
  const { copyToClipboard, isCopied } = useCopy();
  const { data: org } = trpc.viewer.organizations.listCurrent.useQuery();
  const { data: attributes } = trpc.viewer.attributes.list.useQuery();
  const { data: teams } = trpc.viewer.organizations.getTeams.useQuery();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const orgBranding = useOrgBranding();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dynamicLinkVisible, setDynamicLinkVisible] = useState(false);
  const { data, isPending, fetchNextPage, isFetching } =
    trpc.viewer.organizations.listMembers.useInfiniteQuery(
      {
        limit: 10,
        searchTerm: debouncedSearchTerm,
        expand: ["attributes"],
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        placeholderData: keepPreviousData,
      }
    );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const adminOrOwner = org?.user.role === "ADMIN" || org?.user.role === "OWNER";
  const domain = orgBranding?.fullDomain ?? WEBAPP_URL;

  const memorisedColumns = useMemo(() => {
    const permissions = {
      canEdit: adminOrOwner,
      canRemove: adminOrOwner,
      canResendInvitation: adminOrOwner,
      canImpersonate: false,
    };
    const generateAttributeColumns = () => {
      if (!attributes?.length) {
        return [];
      }
      return (
        attributes?.map((attribute) => ({
          id: attribute.id,
          header: attribute.name,
          cell: ({ row }) => {
            const attributeValue = row.original.attributes.find((attr) => attr.attributeId === attribute.id);
            console.log({
              attributesOnRow: row.original.attributes,
              attributeId: attribute.id,
              attributeValue: attributeValue?.value,
            });
            if (!attributeValue) return null;
            return <Badge variant="gray">{attributeValue?.value}</Badge>;
          },
        })) ?? []
      );
    };
    const cols: ColumnDef<UserTableUser>[] = [
      // Disabling select for this PR: Will work on actions etc in a follow up
      {
        id: "select",
        enableHiding: false,
        enableSorting: false,
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
        enableHiding: false,
        header: `Member (${totalDBRowCount})`,
        cell: ({ row }) => {
          const { username, email, avatarUrl } = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                alt={username || email}
                imageSrc={getUserAvatarUrl({
                  avatarUrl,
                })}
              />
              <div className="">
                <div
                  data-testid={`member-${username}-username`}
                  className="text-emphasis text-sm font-medium leading-none">
                  {username || "No username"}
                </div>
                <div
                  data-testid={`member-${username}-email`}
                  className="text-subtle mt-1 text-sm leading-none">
                  {email}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (rows, id, filterValue) => {
          const userEmail = rows.original.email;
          return filterValue.includes(userEmail);
        },
      },
      {
        id: "role",
        accessorFn: (data) => data.role,
        header: "Role",
        cell: ({ row, table }) => {
          const { role, username } = row.original;
          return (
            <Badge
              data-testid={`member-${username}-role`}
              variant={role === "MEMBER" ? "gray" : "blue"}
              onClick={() => {
                table.getColumn("role")?.setFilterValue([role]);
              }}>
              {role}
            </Badge>
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
        id: "teams",
        accessorFn: (data) => data.teams.map((team) => team.name),
        header: "Teams",
        cell: ({ row, table }) => {
          const { teams, accepted, email, username } = row.original;
          // TODO: Implement click to filter
          return (
            <div className="flex h-full flex-wrap items-center gap-2">
              {accepted ? null : (
                <Badge
                  data-testid2={`member-${username}-pending`}
                  variant="red"
                  className="text-xs"
                  data-testid={`email-${email.replace("@", "")}-pending`}
                  onClick={() => {
                    table.getColumn("role")?.setFilterValue(["PENDING"]);
                  }}>
                  Pending
                </Badge>
              )}
              {teams.map((team) => (
                <Badge
                  key={team.id}
                  variant="gray"
                  onClick={() => {
                    table.getColumn("teams")?.setFilterValue([team.name]);
                  }}>
                  {team.name}
                </Badge>
              ))}
            </div>
          );
        },
        filterFn: (rows, _, filterValue: string[]) => {
          const teamNames = rows.original.teams.map((team) => team.name);
          return filterValue.some((value: string) => teamNames.includes(value));
        },
      },
      ...generateAttributeColumns(),
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;
          const permissionsRaw = permissions;
          const isSelf = user.id === session?.user.id;

          const permissionsForUser = {
            canEdit: permissionsRaw.canEdit && user.accepted && !isSelf,
            canRemove: permissionsRaw.canRemove && !isSelf,
            canImpersonate:
              user.accepted && !user.disableImpersonation && !isSelf && !!org?.canAdminImpersonate,
            canLeave: user.accepted && isSelf,
            canResendInvitation: permissionsRaw.canResendInvitation && !user.accepted,
          };

          return (
            <TableActions
              user={user}
              permissionsForUser={permissionsForUser}
              dispatch={dispatch}
              domain={domain}
            />
          );
        },
      },
    ];

    return cols;
  }, [session?.user.id, adminOrOwner, dispatch, domain, totalDBRowCount, attributes]);

  //we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(() => data?.pages?.flatMap((page) => page.rows) ?? [], [data]) as UserTableUser[];
  const totalFetched = flatData.length;

  const table = useReactTable({
    data: flatData,
    columns: memorisedColumns,
    enableRowSelection: true,
    debugTable: true,
    manualPagination: true,
    initialState: {
      columnVisibility: initalColumnVisibility,
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const fetchMoreOnBottomReached = useFetchMoreOnBottomReached(
    tableContainerRef,
    fetchNextPage,
    isFetching,
    totalFetched,
    totalDBRowCount
  );

  const numberOfSelectedRows = table.getSelectedRowModel().rows.length;

  return (
    <>
      <DataTable
        data-testid="user-list-data-table"
        table={table}
        tableContainerRef={tableContainerRef}
        isPending={isPending}
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}>
        <DataTableToolbar.Root>
          <div className="flex w-full gap-2">
            <DataTableToolbar.SearchBar table={table} onSearch={(value) => setDebouncedSearchTerm(value)} />
            <DataTableFilters.FilterButton table={table} />
            <DataTableFilters.ColumnVisibilityButton table={table} />
            {adminOrOwner && (
              <DataTableToolbar.CTA
                type="button"
                color="primary"
                StartIcon="plus"
                className="rounded-md"
                onClick={() =>
                  dispatch({
                    type: "INVITE_MEMBER",
                    payload: {
                      showModal: true,
                    },
                  })
                }
                data-testid="new-organization-member-button">
                {t("add")}
              </DataTableToolbar.CTA>
            )}
          </div>
          <div className="flex gap-2 justify-self-start">
            <DataTableFilters.ActiveFilters table={table} />
          </div>
        </DataTableToolbar.Root>
        {numberOfSelectedRows > 0 && (
          <DataTableSelectionBar.Root>
            <p className="text-brand-subtle w-full px-2 text-center leading-none">
              {numberOfSelectedRows} selected
            </p>
            <TeamListBulkAction table={table} />
            <MassAssignAttributesBulkAction table={table} />
            <EventTypesList table={table} orgTeams={teams} />
            <DeleteBulkUsers
              users={table.getSelectedRowModel().flatRows.map((row) => row.original)}
              onRemove={() => table.toggleAllPageRowsSelected(false)}
            />
          </DataTableSelectionBar.Root>
        )}
      </DataTable>

      {state.deleteMember.showModal && <DeleteMemberModal state={state} dispatch={dispatch} />}
      {state.inviteMember.showModal && <InviteMemberModal dispatch={dispatch} />}
      {state.impersonateMember.showModal && <ImpersonationMemberModal dispatch={dispatch} state={state} />}
      {state.changeMemberRole.showModal && <ChangeUserRoleModal dispatch={dispatch} state={state} />}
      {state.editSheet.showModal && <EditUserSheet dispatch={dispatch} state={state} />}
    </>
  );
}
