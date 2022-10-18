import React from "react";

import { CAL_URL } from "./constants";

// Ensures tw prop is typed.
declare module "react" {
  interface HTMLAttributes<T> {
    tw?: string;
  }
}

const urlPrefix = process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_WEBAPP_URL;

export interface MeetingImageProps {
  title: string;
  meeting: { name: string; image?: string | null };
  users: { name: string; username: string }[];
}

export interface AppImageProps {
  name: string;
  description: string;
  slug: string;
}

const joinMultipleNames = (names: string[] = []) => {
  const lastName = names.pop();
  return `${names.length > 0 ? `${names.join(", ")} & ${lastName}` : lastName}`;
};

/**
 * Test urls:
 * 1. 1 user http://localhost:3000/api/social/og/image?type=meeting&title=super%20long%20event%20title%20for%20testing%20purposes&meetingProfileName=Pro%20Example&meetingImage=http://localhost:3000/pro/avatar.png&names=Pro%20Example&usernames=pro
 * 2. Team event (collection), lot's of people, long title http://localhost:3000/api/social/og/image?type=meeting&title=Getting%20to%20know%20us%20and%20have%20a%20beer%20together&meetingProfileName=Seeded%20Team&names=Team%20Pro%20Example%202&names=Team%20Pro%20Example%203&names=Team%20Pro%20Example%204&names=Team%20Free%20Example&names=Team%20Pro%20Example&usernames=teampro2&usernames=teampro3&usernames=teampro4&usernames=teamfree&usernames=teampro
 * 3. Team event of 2 (collection), http://localhost:3000/api/social/og/image?type=meeting&title=Getting%20to%20know%20each%20other&meetingProfileName=Seeded%20Team&names=Team%20Pro%20Example%202&names=Team%20Pro%20Example%203&usernames=teampro2&usernames=teampro3
 * 4. Team event (round robin) http://localhost:3000/api/social/og/image?type=meeting&title=Round%20Robin%20Seeded%20Team%20Event&names=Seeded%20Team&usernames=seeded-team
 * 5. Dynamic collective (2 persons) http://localhost:3000/api/social/og/image?type=meeting&title=15min&meetingProfileName=Team%20Pro%20Example,%20Pro%20Example&names=Team%20Pro%20Example&names=Pro%20Example&usernames=teampro&usernames=pro
 */
export const constructMeetingImage = ({ title, users, meeting }: MeetingImageProps): string => {
  return [
    `?type=meeting`,
    `&title=${encodeURIComponent(title)}`,
    `&meetingProfileName=${encodeURIComponent(meeting.name)}`,
    meeting.image && `&meetingImage=${encodeURIComponent(meeting.image)}`,
    `${users.map((user) => `&names=${encodeURIComponent(user.name)}`).join("")}`,
    `${users.map((user) => `&usernames=${encodeURIComponent(user.username)}`).join("")}`,
    // Joinining a multiline string for readability.
  ].join("");
};

export const constructAppImage = ({ name, slug, description }: AppImageProps): string => {
  return [
    `?type=app`,
    `&name=${encodeURIComponent(name)}`,
    `&slug=${encodeURIComponent(slug)}`,
    `&description=${encodeURIComponent(description)}`,
    // Joinining a multiline string for readability.
  ].join("");
};

const Wrapper = ({
  children,
  variant = "light",
}: {
  children: React.ReactNode;
  variant?: "light" | "dark";
}) => (
  <div tw="flex w-full h-full">
    <img
      tw="flex absolute left-0 top-0 w-full h-[110%]"
      src={`${urlPrefix}/social-bg-${variant}.jpg`}
      alt="background"
      width="1200"
      height="300"
    />
    <div tw="flex flex-col w-full h-full items-start justify-center w-[1040px] mx-auto">{children}</div>
  </div>
);

export const Meeting = ({ title, users, meeting }: MeetingImageProps) => {
  // We filter attendees here based on whether they have an image and filter duplicates.
  // Users ALWAYS have an image (albeit a gray empty person avatar), so this mainly filters out
  // any non existing images for dynamic collectives, while at the same time removing them from
  // the names list, because the profile name of that event is a concatenation of all names.
  const attendees = (meeting.image ? [meeting, ...users] : users).filter(
    (value, index, self) => self.findIndex((v) => v.name === value.name) == index
  );

  // Construct list of avatar urls, removes duplicates and empty profile images
  const avatars = attendees
    .map((user) => {
      if (meeting.image) return meeting.image;
      if ("username" in user && user.username) return `${CAL_URL}/${user.username}/avatar.png`;
      return null;
    })
    .filter(Boolean) as string[];

  // In case there is NO other attendee than the single meeting profile without an image, we add
  // that name back in here, since the event probably is a round robin event.
  const names = attendees.length > 0 ? attendees.map((user) => user.name) : [meeting.name];

  return (
    <Wrapper>
      <div tw="min-h-[470px] flex flex-col justify-start">
        <div tw="flex items-center justify-center" style={{ fontFamily: "cal", fontWeight: "300" }}>
          <img src={`${urlPrefix}/cal-logo-word-black.svg`} width="350" alt="Logo" />
          {avatars.length > 0 && <div tw="font-bold text-black text-[92px] mx-8 bottom-2">/</div>}
          <div tw="flex flex-row">
            {avatars.slice(0, 3).map((avatar) => (
              <img
                tw="rounded-full mr-[-36px] border-[6px] border-black"
                key={avatar}
                src={avatar}
                alt="Profile picture"
                width="200"
              />
            ))}
            {avatars.length > 3 && (
              <div
                tw="flex items-center top-[50%] justify-center w-24 h-24 rounded-full bg-black text-white text-4xl font-bold"
                style={{ transform: "translateY(-50%)" }}>
                +{avatars.length - 3}
              </div>
            )}
          </div>
        </div>
        <div tw="relative flex text-[54px] w-[80%] flex-col text-black mt-auto">
          <div tw="flex">
            Meet{" "}
            <strong tw="flex ml-4 font-medium" style={{ whiteSpace: "nowrap" }}>
              {joinMultipleNames(names)}
            </strong>
          </div>
          <div tw="flex mt-2" style={{ whiteSpace: "nowrap" }}>
            {title}
          </div>
          {/* Adds overlay gradient for long text */}
          <div
            tw="absolute flex w-[280px] h-full left-[850px] top-0"
            style={{
              background: "linear-gradient(90deg, rgba(198,203,212,0) 0%, rgba(198,203,212,1) 70%)",
            }}
          />
        </div>
      </div>
    </Wrapper>
  );
};

export const App = ({ name, description, slug }: AppImageProps) => (
  <Wrapper variant="dark">
    <img
      src={`${urlPrefix}/cal-logo-word-dark.svg`}
      width="150"
      alt="Logo"
      tw="absolute right-[40px] top-[40px]"
    />
    <div tw="flex items-center justify-center">
      <div tw="flex items-center justify-center flex-row-reverse bg-[#1E1F23] p-8 rounded-md w-[172px] h-[172px]">
        <img src={`${urlPrefix}${slug}`} alt="App icon" width="125" />
      </div>
    </div>
    <div tw="flex mt-10 text-center items-center justify-center w-[80%] flex-col text-[#f9fafb]">
      <div tw="flex text-[56px] mb-6" style={{ fontFamily: "cal", fontWeight: "300" }}>
        {name}
      </div>
      <div tw="flex text-[40px] font-[inter]">{description}</div>
    </div>
  </Wrapper>
);
