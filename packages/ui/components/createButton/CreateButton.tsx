import { useRouter } from "next/router";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@calcom/ui";
import { FiPlus } from "@calcom/ui/components/icon";

export interface Parent {
  teamId: number | null | undefined; // if undefined, then it's a profile
  name?: string | null;
  slug?: string | null;
  image?: string | null;
}

interface CreateBtnProps {
  // set true for use on the team settings page
  canAdd: boolean;
  // set true when in use on the team settings page
  isIndividualTeam?: boolean;
  // EventTypeParent can be a profile (as first option) or a team for the rest.
  options: Parent[];

  createDialog?: () => JSX.Element;
  duplicateDialog?: () => JSX.Element;
  createFunction?: (teamId?: number) => void;
  subtitle?: string;
  buttonText?: string;
  isLoading?: boolean;
  disableMobileButton?: boolean;
}

export function CreateButton(props: CreateBtnProps) {
  const { t } = useLocale();
  const router = useRouter();

  const CreateDialog = props.createDialog ? props.createDialog() : null;
  const DuplicateDialog = props.duplicateDialog ? props.duplicateDialog() : null;

  const hasTeams = !!props.options.find((option) => option.teamId);

  // inject selection data into url for correct router history
  const openModal = (option: Parent) => {
    const query = {
      ...router.query,
      dialog: "new",
      eventPage: option.slug,
      teamId: option.teamId,
    };
    if (!option.teamId) {
      delete query.teamId;
    }
    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      {!hasTeams || props.isIndividualTeam ? (
        <Button
          onClick={() => openModal(props.options[0])}
          data-testid="new-event-type"
          StartIcon={FiPlus}
          variant={props.disableMobileButton ? "button" : "fab"}
          disabled={!props.canAdd}>
          {props.buttonText ? props.buttonText : t("new")}
        </Button>
      ) : (
        <Dropdown>
          <DropdownMenuTrigger asChild>
            <Button
              variant={props.disableMobileButton ? "button" : "fab"}
              StartIcon={FiPlus}
              loading={props.isLoading}>
              {props.buttonText ? props.buttonText : t("new")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={14} align="end">
            <DropdownMenuLabel>
              <div className="w-48 text-xs">{props.subtitle}</div>
            </DropdownMenuLabel>
            {props.options.map((option) => (
              <DropdownMenuItem key={option.slug}>
                <DropdownItem
                  type="button"
                  StartIcon={(props: any) => (
                    <Avatar
                      alt={option.name || ""}
                      imageSrc={option.image || `${WEBAPP_URL}/${option.slug}/avatar.png`} // if no image, use default avatar
                      size="sm"
                      {...props}
                    />
                  )}
                  onClick={() =>
                    !!CreateDialog
                      ? openModal(option)
                      : props.createFunction
                      ? props.createFunction(option.teamId || undefined)
                      : null
                  }>
                  {" "}
                  {/*improve this code */}
                  <span>{option.name ? option.name : option.slug}</span>
                </DropdownItem>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </Dropdown>
      )}
      {router.query.dialog === "duplicate" && DuplicateDialog}
      {router.query.dialog === "new" && CreateDialog}
    </>
  );
}
