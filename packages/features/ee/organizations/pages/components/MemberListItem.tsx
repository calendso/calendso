import classNames from "classnames";

import { useBookerUrl } from "@calcom/lib/hooks/useBookerUrl";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import {
  Avatar,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
} from "@calcom/ui";
import { ExternalLink, MoreHorizontal } from "@calcom/ui/components/icon";

interface Props {
  member: RouterOutputs["viewer"]["organizations"]["listOtherTeamMembers"][number];
}

export default function MemberListItem(props: Props) {
  const { t } = useLocale();
  const { member } = props;

  const { user } = member;
  const bookerUrl = useBookerUrl();
  const bookerUrlWithoutProtocol = bookerUrl.replace(/^https?:\/\//, "");
  const bookingLink = !!user.username && `${bookerUrlWithoutProtocol}/${user.username}`;
  const name = user.name || user.username || user.email;

  return (
    <li className="divide-subtle divide-y px-5">
      <div className="my-4 flex justify-between">
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <div className="flex">
            <Avatar
              size="sm"
              imageSrc={bookerUrl + "/" + user.username + "/avatar.png"}
              alt={name || ""}
              className="h-10 w-10 rounded-full"
            />

            <div className="ms-3 inline-block">
              <div className="mb-1 flex">
                <span className="text-default mr-1 text-sm font-bold leading-4">{name}</span>

                {/* {!props.member.accepted && <TeamPill color="orange" text={t("pending")} />} */}
                {/* {props.member.role && <TeamRole role={props.member.role} />} */}
              </div>
              <div className="text-default flex items-center">
                <span className=" block text-sm" data-testid="member-email" data-email={user.email}>
                  {user.email}
                </span>
                {bookingLink && (
                  <>
                    <span className="text-default mx-2 block">•</span>
                    <a
                      target="_blank"
                      href={`${bookerUrl}/${user.username}`}
                      className="text-default block text-sm">
                      {bookingLink}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ButtonGroup combined containerProps={{ className: "border-default hidden md:flex" }}>
            <Tooltip content={t("view_public_page")}>
              <Button
                target="_blank"
                href={`${bookerUrl}/${user.username}`}
                color="secondary"
                className={classNames("rounded-r-md")}
                variant="icon"
                StartIcon={ExternalLink}
                disabled={!member.accepted}
              />
            </Tooltip>
          </ButtonGroup>
          <div className="flex md:hidden">
            <Dropdown>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="icon" color="minimal" StartIcon={MoreHorizontal} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="outline-none">
                  <DropdownItem
                    disabled={!member.accepted}
                    href={!member.accepted ? undefined : "/" + user.username}
                    target="_blank"
                    type="button"
                    StartIcon={ExternalLink}>
                    {t("view_public_page")}
                  </DropdownItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Dropdown>
          </div>
        </div>
      </div>
    </li>
  );
}
