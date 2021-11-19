import { HashtagIcon, InformationCircleIcon, LinkIcon, PhotographIcon } from "@heroicons/react/solid";
import React, { FormEvent, useRef, useState } from "react";

import { handleErrorsJson } from "@lib/errors";
import { useLocale } from "@lib/hooks/useLocale";
import showToast from "@lib/notification";
import { TeamWithMembers } from "@lib/queries/teams";

import ImageUploader from "@components/ImageUploader";
import Button from "@components/ui/Button";
import SettingInputContainer from "@components/ui/SettingInputContainer";
import { UsernameInput } from "@components/ui/UsernameInput";

interface Props {
  team: TeamWithMembers | null | undefined;
}

export default function EditTeam(props: Props) {
  const { t } = useLocale();
  const nameRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const teamUrlRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const descriptionRef = useRef<HTMLTextAreaElement>() as React.MutableRefObject<HTMLTextAreaElement>;
  const hideBrandingRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const logoRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;

  const [team, setTeam] = useState<TeamWithMembers | null | undefined>(props.team);
  const [imageSrc, setImageSrc] = useState<string>("");

  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasLogo = !!team?.logo;

  // const deleteTeam = () => {
  //   return fetch("/api/teams/" + props.team?.id, {
  //     method: "DELETE",
  //   });
  // };
  const loadTeam = () => {
    return fetch("/api/teams/" + team?.id, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setTeam(data.team));
  };

  async function updateTeamHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const enteredUsername = teamUrlRef?.current?.value.toLowerCase();
    const enteredName = nameRef?.current?.value;
    const enteredLogo = logoRef?.current?.value;
    const enteredDescription = descriptionRef?.current?.value;
    const enteredHideBranding = hideBrandingRef?.current?.checked;

    // TODO: Add validation
    const obj: Record<string, unknown> = {
      username: enteredUsername,
      name: enteredName,
      description: enteredDescription,
      hideBranding: enteredHideBranding,
    };
    // only add logo if it has changed - this is a hotfix, will find better fix
    if (enteredLogo) obj.logo = enteredLogo;

    await fetch("/api/teams/" + team?.id + "/profile", {
      method: "PATCH",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleErrorsJson)
      .then(() => {
        showToast(t("your_team_updated_successfully"), "success");
        loadTeam();
        setHasErrors(false); // dismiss any open errors
      })
      .catch((err) => {
        setHasErrors(true);
        setErrorMessage(err.message);
      });
  }

  const handleLogoChange = (newLogo: string) => {
    logoRef.current.value = newLogo;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement?.prototype, "value")?.set;
    nativeInputValueSetter?.call(logoRef.current, newLogo);
    const ev2 = new Event("input", { bubbles: true });
    logoRef?.current?.dispatchEvent(ev2);
    updateTeamHandler(ev2 as unknown as FormEvent<HTMLFormElement>);
    setImageSrc(newLogo);
  };

  return (
    <div className="divide-y divide-gray-200 lg:col-span-9">
      <div className="">
        {/* TODO USE THESE VARS */}
        {hasErrors && <></>}
        {errorMessage && <></>}
        <form className="divide-y divide-gray-200 lg:col-span-9" onSubmit={(e) => updateTeamHandler(e)}>
          <div className="py-6 lg:pb-8">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-grow space-y-6">
                <SettingInputContainer
                  Icon={LinkIcon}
                  label="Team URL"
                  Input={<UsernameInput ref={teamUrlRef} defaultValue={team?.slug as string} />}
                />
                <SettingInputContainer
                  Icon={HashtagIcon}
                  label="Team Name"
                  Input={
                    <input
                      ref={nameRef}
                      type="text"
                      name="name"
                      id="name"
                      placeholder={t("your_team_name")}
                      required
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-neutral-800 focus:border-neutral-800 sm:text-sm"
                      defaultValue={team?.name as string}
                    />
                  }
                />
                <hr />
                <div>
                  <SettingInputContainer
                    Icon={InformationCircleIcon}
                    label={t("about")}
                    Input={
                      <>
                        <textarea
                          ref={descriptionRef}
                          id="about"
                          name="about"
                          rows={3}
                          defaultValue={team?.bio as string}
                          className="block w-full mt-1 border-gray-300 rounded-sm shadow-sm focus:ring-neutral-800 focus:border-neutral-800 sm:text-sm"></textarea>
                        <p className="mt-2 text-sm text-gray-500">{t("team_description")}</p>
                      </>
                    }
                  />
                </div>
                <div>
                  <SettingInputContainer
                    Icon={PhotographIcon}
                    label={"Logo"}
                    Input={
                      <>
                        <div className="flex mt-1">
                          <input
                            ref={logoRef}
                            type="hidden"
                            name="avatar"
                            id="avatar"
                            placeholder="URL"
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-neutral-800 focus:border-neutral-800 sm:text-sm"
                            defaultValue={imageSrc ?? team?.logo}
                          />
                          <ImageUploader
                            target="logo"
                            id="logo-upload"
                            buttonMsg={hasLogo ? t("edit_logo") : t("upload_a_logo")}
                            handleAvatarChange={handleLogoChange}
                            imageSrc={imageSrc ?? team?.logo}
                          />
                          {hasLogo && (
                            <Button color="secondary" type="button" className="py-1 ml-1 text-xs">
                              {t("remove_logo")}
                            </Button>
                          )}
                        </div>
                      </>
                    }
                  />

                  <hr className="mt-6" />
                </div>

                <div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hide-branding"
                        name="hide-branding"
                        type="checkbox"
                        ref={hideBrandingRef}
                        defaultChecked={team?.hideBranding}
                        className="w-4 h-4 border-gray-300 rounded-sm focus:ring-neutral-500 text-neutral-900"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hide-branding" className="font-medium text-gray-700">
                        {t("disable_cal_branding")}
                      </label>
                      <p className="text-gray-500">{t("disable_cal_branding_description")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end py-4">
            <Button type="submit" color="primary">
              {t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
