import { ExchangeAuthorizationCodeInput } from "@/modules/oauth/flow/input/exchange-code.input";
import { OAuthClientRepository } from "@/modules/oauth/oauth-client.repository";
import { TokensRepository } from "@/modules/tokens/tokens.repository";
import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class OAuthFlowService {
  private logger = new Logger("OAuthFlowService");

  constructor(
    private readonly tokensRepository: TokensRepository,
    private readonly oAuthClientRepository: OAuthClientRepository
  ) {}

  async propagateAccessToken(accessToken: string) {
    this.logger.log("Propagating access token to redis", accessToken);
    // TODO propagate
    return void 0;
  }

  async validateAccessToken(secret: string) {
    // status can be "CACHE_HIT" or "CACHE_MISS", MISS will most likely mean the token has expired
    // but we need to check the SQL db for it anyways.
    const { status } = await this.readFromCache(secret);

    if (status === "CACHE_HIT") {
      return true;
    }

    const token = await this.tokensRepository.getAccessTokenBySecret(secret);

    if (!token) {
      throw new UnauthorizedException();
    }

    if (new Date() > token?.expiresAt) {
      throw new BadRequestException("Token is expired");
    }

    return true;
  }

  private async readFromCache(secret: string) {
    return { status: "CACHE_MISS" };
  }

  async exchangeAuthorizationToken(
    tokenId: string,
    input: ExchangeAuthorizationCodeInput
  ): Promise<{ access_token: string; refresh_token: string }> {
    const oauthClient = await this.oAuthClientRepository.getOAuthClientWithAuthTokens(
      tokenId,
      input.client_id,
      input.client_secret
    );

    if (!oauthClient) {
      throw new BadRequestException("Invalid OAuth Client.");
    }

    const authorizationToken = oauthClient.authorizationTokens[0];

    if (!authorizationToken || !authorizationToken.owner.id) {
      throw new BadRequestException("Invalid Authorization Token.");
    }

    const { access_token, refresh_token } = await this.tokensRepository.createOAuthTokens(
      input.client_id,
      authorizationToken.owner.id
    );
    void this.propagateAccessToken(access_token); // voided as we don't need to await

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(clientId: string, clientSecret: string, tokenSecret: string) {
    const oauthClient = await this.oAuthClientRepository.getOAuthClientWithRefreshSecret(
      clientId,
      clientSecret,
      tokenSecret
    );

    if (!oauthClient) {
      throw new BadRequestException("Invalid OAuthClient credentials.");
    }

    const currentRefreshToken = oauthClient.refreshToken[0];

    if (!currentRefreshToken) {
      throw new BadRequestException("Invalid refresh token");
    }

    const { accessToken, refreshToken } = await this.tokensRepository.refreshOAuthTokens(
      clientId,
      currentRefreshToken.secret,
      currentRefreshToken.userId
    );

    return {
      access_token: accessToken.secret,
      refresh_token: refreshToken.secret,
    };
  }
}
