import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";

const credentials = process.env.GOOGLE_API_CREDENTIALS!;
const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Check that user is authenticated
    const session = await getSession({ req: req });

    if (!session) {
      res.status(401).json({ message: "You must be logged in to do this" });
      return;
    }

    // Get token from Google Calendar API
    const { client_secret, client_id } = JSON.parse(credentials).web;
    const redirect_uri = process.env.BASE_URL + "/api/integrations/googlecalendar/callback";
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      // A refresh token is only returned the first time the user
      // consents to providing access.  For illustration purposes,
      // setting the prompt to 'consent' will force this consent
      // every time, forcing a refresh_token to be returned.
      prompt: "consent",
    });

    res.status(200).json({ url: authUrl });
  }
}
