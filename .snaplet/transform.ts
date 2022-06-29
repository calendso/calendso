// This transform config was generated by Snaplet.
// Snaplet found fields that may contain personally identifiable information (PII)
// and used that to populate this file.
import { copycat } from "@snaplet/copycat";

import type { Transform } from "./structure";

function hasStringProp<T extends string>(x: unknown, key: T): x is { [key in T]: string } {
  return !!x && typeof x === "object" && key in x;
}

function replaceKeyIfExists<T extends string>(x: object, key: T) {
  if (hasStringProp(x, key)) {
    return { ...x, [key]: copycat.uuid(x[key]) };
  }
  return x;
}

function generateSlug(x: string) {
  return copycat.words(x, { max: 3 }).split(" ").join("-");
}

function replaceSensitiveKeys(record: object) {
  return {
    ...record,
    ...replaceKeyIfExists(record, "client_id"),
    ...replaceKeyIfExists(record, "client_secret"),
    ...replaceKeyIfExists(record, "public_key"),
    ...replaceKeyIfExists(record, "api_key"),
    ...replaceKeyIfExists(record, "signing_secret"),
    ...replaceKeyIfExists(record, "access_token"),
    ...replaceKeyIfExists(record, "refresh_token"),
    ...replaceKeyIfExists(record, "stripe_user_id"),
    ...replaceKeyIfExists(record, "stripe_publishable_key"),
    ...replaceKeyIfExists(record, "accessToken"),
    ...replaceKeyIfExists(record, "refreshToken"),
    ...replaceKeyIfExists(record, "bot_user_id"),
    ...replaceKeyIfExists(record, "app_id"),
  };
}

const config: Transform = () => ({
  public: {
    _user_eventtype: ({ row }) => ({
      A: copycat.int(row.A),
      B: copycat.int(row.B),
    }),
    ApiKey: ({ row }) => ({
      note: copycat.sentence(row.note),
    }),
    App: ({ row }) => ({
      keys: replaceSensitiveKeys(row.keys),
    }),
    Attendee: ({ row }) => ({
      email: copycat.email(row.email),
      name: copycat.fullName(row.name),
      timeZone: copycat.timezone(row.timeZone),
    }),
    Availability: ({ row }) => ({
      // date: copycat.fullName(row.date),
    }),
    Credential: ({ row }) => ({
      key: typeof row.key === "string" ? copycat.uuid(row.key) : replaceSensitiveKeys(row.key),
    }),
    EventType: ({ row }) => ({
      slug: generateSlug(row.slug),
      timeZone: copycat.timezone(row.timeZone),
    }),
    Feedback: ({ row }) => ({
      // date: copycat.dateString(row.date),
    }),
    ResetPasswordRequest: ({ row }) => ({
      email: copycat.email(row.email),
    }),
    Schedule: ({ row }) => ({
      timeZone: copycat.timezone(row.timeZone),
    }),
    Team: ({ row }) => ({
      bio: copycat.sentence(row.bio),
      name: copycat.words(row.name, { max: 2 }),
      slug: generateSlug(row.slug),
    }),
    users: ({ row }) => ({
      bio: copycat.sentence(row.bio),
      email: copycat.email(row.email),
      name: copycat.fullName(row.name),
      password: copycat.password(row.password),
      timeZone: copycat.timezone(row.timeZone),
      username: generateSlug(row.username),
    }),
    VerificationToken: ({ row }) => ({
      token: copycat.uuid(row.token),
    }),
  },
});

export default config;
