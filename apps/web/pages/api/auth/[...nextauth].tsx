import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { IdentityProvider } from "@prisma/client";
import { readFileSync } from "fs";
import Handlebars from "handlebars";
import NextAuth, { Session } from "next-auth";
import { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer, { TransportOptions } from "nodemailer";
import { authenticator } from "otplib";
import path from "path";

import { WEBSITE_URL } from "@calcom/lib/constants";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import { defaultCookies } from "@calcom/lib/default-cookies";
import { serverConfig } from "@calcom/lib/serverConfig";

import { ErrorCode, verifyPassword } from "@lib/auth";
import prisma from "@lib/prisma";
import { randomString } from "@lib/random";
import { hostedCal, isSAMLLoginEnabled, samlLoginUrl } from "@lib/saml";
import slugify from "@lib/slugify";

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IS_GOOGLE_LOGIN_ENABLED } from "@server/lib/constants";

const transporter = nodemailer.createTransport<TransportOptions>({
  ...(serverConfig.transport as TransportOptions),
} as TransportOptions);

const usernameSlug = (username: string) => slugify(username) + "-" + randomString(6).toLowerCase();

const providers: Provider[] = [
  CredentialsProvider({
    id: "credentials",
    name: "Cal.com",
    type: "credentials",
    credentials: {
      email: { label: "Email Address", type: "email", placeholder: "john.doe@example.com" },
      password: { label: "Password", type: "password", placeholder: "Your super secure password" },
      totpCode: { label: "Two-factor Code", type: "input", placeholder: "Code from authenticator app" },
    },
    async authorize(credentials) {
      if (!credentials) {
        console.error(`For some reason credentials are missing`);
        throw new Error(ErrorCode.InternalServerError);
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email.toLowerCase(),
        },
      });

      if (!user) {
        throw new Error(ErrorCode.UserNotFound);
      }

      if (user.identityProvider !== IdentityProvider.CAL) {
        throw new Error(ErrorCode.ThirdPartyIdentityProviderEnabled);
      }

      if (!user.password) {
        throw new Error(ErrorCode.UserMissingPassword);
      }

      const isCorrectPassword = await verifyPassword(credentials.password, user.password);
      if (!isCorrectPassword) {
        throw new Error(ErrorCode.IncorrectPassword);
      }

      if (user.twoFactorEnabled) {
        if (!credentials.totpCode) {
          throw new Error(ErrorCode.SecondFactorRequired);
        }

        if (!user.twoFactorSecret) {
          console.error(`Two factor is enabled for user ${user.id} but they have no secret`);
          throw new Error(ErrorCode.InternalServerError);
        }

        if (!process.env.CALENDSO_ENCRYPTION_KEY) {
          console.error(`"Missing encryption key; cannot proceed with two factor login."`);
          throw new Error(ErrorCode.InternalServerError);
        }

        const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);
        if (secret.length !== 32) {
          console.error(
            `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
          );
          throw new Error(ErrorCode.InternalServerError);
        }

        const isValidToken = authenticator.check(credentials.totpCode, secret);
        if (!isValidToken) {
          throw new Error(ErrorCode.IncorrectTwoFactorCode);
        }
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      };
    },
  }),
];

if (IS_GOOGLE_LOGIN_ENABLED) {
  providers.push(
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    })
  );
}

if (isSAMLLoginEnabled) {
  providers.push({
    id: "saml",
    name: "BoxyHQ",
    type: "oauth",
    version: "2.0",
    checks: ["pkce", "state"],
    authorization: {
      url: `${samlLoginUrl}/api/auth/saml/authorize`,
      params: {
        scope: "",
        response_type: "code",
        provider: "saml",
      },
    },
    token: {
      url: `${samlLoginUrl}/api/auth/saml/token`,
      params: { grant_type: "authorization_code" },
    },
    userinfo: `${samlLoginUrl}/api/auth/saml/userinfo`,
    profile: (profile) => {
      return {
        id: profile.id || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        email_verified: true,
      };
    },
    options: {
      clientId: "dummy",
      clientSecret: "dummy",
    },
  });
}

if (true) {
  const emailsDir = path.resolve(process.cwd(), "lib", "emails", "templates");
  providers.push(
    EmailProvider({
      maxAge: 10 * 60 * 60, // Magic links are valid for 10 min only
      // Here we setup the sendVerificationRequest that calls the email template with the identifier (email) and token to verify.
      sendVerificationRequest: ({ identifier, url }) => {
        // Here we add /new endpoint to the callback URL by adding it before &token=.
        // This is not elegant but it works. We should probably use a different approach when we can.
        url = url.includes("/auth/new") ? url : url.replace("&token", "/auth/new&token");
        const emailFile = readFileSync(path.join(emailsDir, "confirm-email.html"), {
          encoding: "utf8",
        });
        const emailTemplate = Handlebars.compile(emailFile);
        transporter.sendMail({
          from: `${process.env.EMAIL_FROM}` || "Cal.com",
          to: identifier,
          subject: "Your sign-in link for Cal.com",
          html: emailTemplate({
            base_url: WEBSITE_URL,
            signin_url: url,
            email: identifier,
          }),
        });
      },
    })
  );
}

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  /** @deprecated remove once PR#2122 is merged */
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  },
  cookies: defaultCookies(WEBSITE_URL?.startsWith("https://")),
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
    newUser: "/auth/new", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      const autoMergeIdentities = async () => {
        if (!hostedCal) {
          const existingUser = await prisma.user.findFirst({
            where: { email: token.email! },
          });

          if (!existingUser) {
            return token;
          }

          return {
            id: existingUser.id,
            username: existingUser.username,
            name: existingUser.name,
            email: existingUser.email,
          };
        }

        return token;
      };

      if (!user) {
        return await autoMergeIdentities();
      }

      if (account && account.type === "credentials") {
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        };
      }

      // The arguments above are from the provider so we need to look up the
      // user based on those values in order to construct a JWT.
      if (account && account.type === "oauth" && account.provider && account.providerAccountId) {
        let idP: IdentityProvider = IdentityProvider.GOOGLE;
        if (account.provider === "saml") {
          idP = IdentityProvider.SAML;
        }

        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [
              {
                identityProvider: idP,
              },
              {
                identityProviderId: account.providerAccountId as string,
              },
            ],
          },
        });

        if (!existingUser) {
          return await autoMergeIdentities();
        }

        return {
          id: existingUser.id,
          name: existingUser.name,
          username: existingUser.username,
          email: existingUser.email,
        };
      }

      return token;
    },
    async session({ session, token }) {
      const calendsoSession: Session = {
        ...session,
        user: {
          ...session.user,
          id: token.id as number,
          name: token.name,
          username: token.username as string,
        },
      };
      return calendsoSession;
    },
    async signIn(params) {
      const { user, account, profile } = params;
      if (account.provider === "email") {
        return true;
      }
      // In this case we've already verified the credentials in the authorize
      // callback so we can sign the user in.
      if (account.type === "credentials") {
        return true;
      }

      if (account.type !== "oauth") {
        return false;
      }

      if (!user.email) {
        return false;
      }

      if (!user.name) {
        return false;
      }

      if (account.provider) {
        let idP: IdentityProvider = IdentityProvider.GOOGLE;
        if (account.provider === "saml") {
          idP = IdentityProvider.SAML;
        }
        user.email_verified = user.email_verified || profile.email_verified;

        if (!user.email_verified) {
          return "/auth/error?error=unverified-email";
        }

        const existingUser = await prisma.user.findFirst({
          where: {
            AND: [{ identityProvider: idP }, { identityProviderId: user.id as string }],
          },
        });

        if (existingUser) {
          // In this case there's an existing user and their email address
          // hasn't changed since they last logged in.
          if (existingUser.email === user.email) {
            return true;
          }

          // If the email address doesn't match, check if an account already exists
          // with the new email address. If it does, for now we return an error. If
          // not, update the email of their account and log them in.
          const userWithNewEmail = await prisma.user.findFirst({
            where: { email: user.email },
          });

          if (!userWithNewEmail) {
            await prisma.user.update({ where: { id: existingUser.id }, data: { email: user.email } });
            return true;
          } else {
            return "/auth/error?error=new-email-conflict";
          }
        }

        // If there's no existing user for this identity provider and id, create
        // a new account. If an account already exists with the incoming email
        // address return an error for now.
        const existingUserWithEmail = await prisma.user.findFirst({
          where: { email: user.email },
        });

        if (existingUserWithEmail) {
          // if self-hosted then we can allow auto-merge of identity providers if email is verified
          if (!hostedCal && existingUserWithEmail.emailVerified) {
            return true;
          }

          // check if user was invited
          if (
            !existingUserWithEmail.password &&
            !existingUserWithEmail.emailVerified &&
            !existingUserWithEmail.username
          ) {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                // Slugify the incoming name and append a few random characters to
                // prevent conflicts for users with the same name.
                username: usernameSlug(user.name),
                emailVerified: new Date(Date.now()),
                name: user.name,
                identityProvider: idP,
                identityProviderId: user.id as string,
              },
            });

            return true;
          }

          if (existingUserWithEmail.identityProvider === IdentityProvider.CAL) {
            return "/auth/error?error=use-password-login";
          }

          return "/auth/error?error=use-identity-login";
        }

        await prisma.user.create({
          data: {
            // Slugify the incoming name and append a few random characters to
            // prevent conflicts for users with the same name.
            username: usernameSlug(user.name),
            emailVerified: new Date(Date.now()),
            name: user.name,
            email: user.email,
            identityProvider: idP,
            identityProviderId: user.id as string,
          },
        });

        return true;
      }

      return false;
    },
  },
});
