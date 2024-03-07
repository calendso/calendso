import { BaseStrategy } from "@/lib/passport/strategies/types";
import { OAuthFlowService } from "@/modules/oauth-clients/services/oauth-flow.service";
import { TokensRepository } from "@/modules/tokens/tokens.repository";
import { UserWithProfile, UsersRepository } from "@/modules/users/users.repository";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";

import { INVALID_ACCESS_TOKEN } from "@calcom/platform-constants";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(BaseStrategy, "access-token") {
  constructor(
    private readonly oauthFlowService: OAuthFlowService,
    private readonly tokensRepository: TokensRepository,
    private readonly userRepository: UsersRepository
  ) {
    super();
  }

  async authenticate(request: Request) {
    try {
      const accessToken = request.get("Authorization")?.replace("Bearer ", "");

      if (!accessToken) {
        throw new UnauthorizedException(INVALID_ACCESS_TOKEN);
      }

      await this.oauthFlowService.validateAccessToken(accessToken);

      const ownerId = await this.tokensRepository.getAccessTokenOwnerId(accessToken);

      if (!ownerId) {
        throw new UnauthorizedException(INVALID_ACCESS_TOKEN);
      }

      const user: UserWithProfile | null = await this.userRepository.findByIdWithProfile(ownerId);

      if (!user) {
        throw new UnauthorizedException(INVALID_ACCESS_TOKEN);
      }

      return this.success(user);
    } catch (error) {
      if (error instanceof Error) return this.error(error);
    }
  }
}
