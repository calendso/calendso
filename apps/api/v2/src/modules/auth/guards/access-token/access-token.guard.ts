import { OAuthFlowService } from "@/modules/endpoints/oauth-clients/services/oauth-flow.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly oauthFlowService: OAuthFlowService) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const bearer = authHeader?.replace("Bearer ", "").trim();
    if (!bearer) {
      throw new UnauthorizedException("Access token is missing or invalid.");
    }

    return this.oauthFlowService.validateAccessToken(bearer);
  }
}
