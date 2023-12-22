import { getEnv } from "@/env";
import { AuthModule } from "@/modules/auth/auth.module";
import { MembershipsModule } from "@/modules/memberships/memberships.module";
import { OAuthClientUsersController } from "@/modules/oauth-clients/controllers/oauth-client-users/oauth-client-users.controller";
import { OAuthClientsController } from "@/modules/oauth-clients/controllers/oauth-clients/oauth-clients.controller";
import { OAuthFlowController } from "@/modules/oauth-clients/controllers/oauth-flow/oauth-flow.controller";
import { OAuthClientCredentialsGuard } from "@/modules/oauth-clients/guards/oauth-client-credentials/oauth-client-credentials.guard";
import { OAuthClientRepository } from "@/modules/oauth-clients/oauth-client.repository";
import { OAuthFlowService } from "@/modules/oauth-clients/services/oauth-flow.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { TokensRepository } from "@/modules/tokens/tokens.repository";
import { UsersModule } from "@/modules/users/users.module";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MembershipsModule,
    JwtModule.register({ secret: getEnv("JWT_SECRET") }),
  ],
  providers: [OAuthClientRepository, OAuthClientCredentialsGuard, TokensRepository, OAuthFlowService],
  controllers: [OAuthClientUsersController, OAuthClientsController, OAuthFlowController],
  exports: [OAuthClientRepository, OAuthClientCredentialsGuard],
})
export class OAuthClientModule {}
