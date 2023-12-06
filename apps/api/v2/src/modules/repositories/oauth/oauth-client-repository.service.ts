import { CreateOAuthClientDto } from "@/modules/oauth/dtos/create-oauth-client";
import { UpdateOAuthClientSchema } from "@/modules/oauth/dtos/update-oauth-client";
import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";
import { Injectable } from "@nestjs/common";
import { PlatformOAuthClient } from "@prisma/client";
import { z } from "zod";

@Injectable()
export class OAuthClientRepository {
  constructor(private readonly dbRead: PrismaReadService, private readonly dbWrite: PrismaWriteService) {}

  async createOAuthClient(userId: number, data: CreateOAuthClientDto) {
    console.log(userId, data);
    return {
      id: "sample-id",
      client_secret: "sample-secret",
    };
  }

  async getOAuthClient(clientId: string): Promise<PlatformOAuthClient> {
    return this.dbRead.prisma.platformOAuthClient.findUnique({
      where: { id: clientId },
    });
  }

  async getUserOAuthClients(userId: number): Promise<PlatformOAuthClient[]> {
    return this.dbRead.prisma.platformOAuthClient.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
    });
  }

  async updateOAuthClient(
    clientId: string,
    updateData: Partial<z.infer<typeof UpdateOAuthClientSchema>>
  ): Promise<PlatformOAuthClient> {
    return this.dbWrite.prisma.platformOAuthClient.update({
      where: { id: clientId },
      data: updateData,
    });
  }

  async deleteOAuthClient(clientId: string): Promise<PlatformOAuthClient> {
    return this.dbWrite.prisma.platformOAuthClient.delete({
      where: { id: clientId },
    });
  }
}
