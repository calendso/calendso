import { UsersRepository } from "@/modules/repositories/users/users.repository";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { getToken } from "next-auth/jwt";

class BaseStrategy {
  success!: (user: unknown) => void;
  error!: (error: Error) => void;
}

@Injectable()
export class NextAuthStrategy extends PassportStrategy(BaseStrategy, "next-auth") {
  constructor(private readonly userRepository: UsersRepository, private readonly config: ConfigService) {
    super();
  }

  async authenticate(req: Request) {
    try {
      const nextAuthSecret = this.config.get("next.authSecret", { infer: true });
      const payload = await getToken({ req, secret: nextAuthSecret });

      if (!payload) {
        throw new UnauthorizedException("Authentication token is missing or invalid.");
      }

      if (!payload.email) {
        throw new UnauthorizedException("Email not found in the authentication token.");
      }

      const user = await this.userRepository.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException("User associated with the authentication token email not found.");
      }

      return this.success(user);
    } catch (error) {
      if (error instanceof Error) return this.error(error);
    }
  }
}
