import { AppsRepository } from "@/modules/apps/apps.repository";
import { OAuthCallbackState } from "@/modules/conferencing/controllers/conferencing.controller";
import { ConferencingRepository } from "@/modules/conferencing/repositories/conferencing.respository";
import { CredentialsRepository } from "@/modules/credentials/credentials.repository";
import { UsersRepository } from "@/modules/users/users.repository";
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { GOOGLE_MEET } from "@calcom/platform-constants";

import stringify = require("qs-stringify");

const zoomAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

@Injectable()
export class ZoomVideoService {
  private logger = new Logger("ZoomVideoService");
  private redirectUri = `${this.config.get("api.url")}/conferencing/zoom/oauth/callback`;

  constructor(
    private readonly config: ConfigService,
    private readonly conferencingRepository: ConferencingRepository,
    private readonly credentialsRepository: CredentialsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly appsRepository: AppsRepository
  ) {}

  async getZoomAppKeys() {
    const app = await this.appsRepository.getAppBySlug("zoom");

    const { client_id, client_secret } = zoomAppKeysSchema.parse(app?.keys);

    if (!client_id) {
      throw new NotFoundException("Zoom app not found");
    }

    if (!client_secret) {
      throw new NotFoundException("Zoom app not found");
    }

    return { client_id, client_secret };
  }

  async generateZoomAuthUrl(state: string) {
    const { client_id } = await this.getZoomAppKeys();

    const params = {
      response_type: "code",
      client_id,
      redirect_uri: this.redirectUri,
      state: JSON.stringify(state),
    };

    const query = stringify(params);
    const url = `https://zoom.us/oauth/authorize?${query}`;
    return { url };
  }

  async connectZoomApp(state: OAuthCallbackState, code: string, userId: number) {
    const { client_id, client_secret } = await this.getZoomAppKeys();
    const redirectUri = encodeURI(this.redirectUri);
    const authHeader = `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`;
    const result = await fetch(
      `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (result.status !== 200) {
      let errorMessage = "Something is wrong with Zoom API";
      try {
        const responseBody = await result.json();
        errorMessage = responseBody.error;
      } catch (e) {
        errorMessage = await result.clone().text();
      }
      throw new BadRequestException(errorMessage);
    }

    const responseBody = await result.json();

    if (responseBody.error) {
      throw new BadRequestException(responseBody.error);
    }

    responseBody.expiry_date = Math.round(Date.now() + responseBody.expires_in * 1000);
    delete responseBody.expires_in;

    if (!userId) {
      throw new UnauthorizedException("Invalid Access token.");
    }
    const existingCredentialZoomVideo = await this.appsRepository.findAppCredintial({
      type: "zoom_video",
      userId,
      appId: "zoom",
    });

    const credentialIdsToDelete = existingCredentialZoomVideo.map((item) => item.id);
    if (credentialIdsToDelete.length > 0) {
      await this.appsRepository.deleteAppCredentials(credentialIdsToDelete, userId);
    }

    await this.appsRepository.createAppCredential(
      "zoom_video",
      responseBody as unknown as Prisma.InputJsonObject,
      userId,
      "zoom"
    );

    return { url: state.returnTo };
  }

  async disconnectZoomApp(userId: number) {
    const googleMeet = await this.conferencingRepository.findGoogleMeet(userId);

    if (!googleMeet) {
      throw new BadRequestException("Google Meet is not connected.");
    }

    const googleMeetCredential = await this.credentialsRepository.deleteUserCredentialById(
      userId,
      googleMeet.id
    );

    return googleMeetCredential;
  }

  async setDefault(userId: number) {
    const user = await this.usersRepository.setDefaultConferencingApp(userId, GOOGLE_MEET);
    const metadata = user.metadata as { defaultConferencingApp?: { appSlug?: string } };

    if (metadata?.defaultConferencingApp?.appSlug !== GOOGLE_MEET) {
      throw new InternalServerErrorException("Could not set Google Meet as default conferencing app");
    }
    return true;
  }
}