import { TestingModule } from "@nestjs/testing";
import { Prisma, Team } from "@prisma/client";
import { PrismaReadService } from "src/modules/prisma/prisma-read.service";
import { PrismaWriteService } from "src/modules/prisma/prisma-write.service";

export class OrganizationRepositoryFixture {
  private primaReadClient: PrismaReadService["prisma"];
  private prismaWriteClient: PrismaWriteService["prisma"];

  constructor(private readonly module: TestingModule) {
    this.primaReadClient = module.get(PrismaReadService).prisma;
    this.prismaWriteClient = module.get(PrismaWriteService).prisma;
  }

  async get(teamId: Team["id"]) {
    return this.primaReadClient.team.findFirst({ where: { id: teamId } });
  }

  async create(data: Prisma.TeamCreateInput) {
    return await this.prismaWriteClient.$transaction(async (prisma) => {
      const team = await prisma.team.create({
        data,
      });

      await prisma.organizationSettings.create({
        data: {
          organizationId: team.id,
          isAdminAPIEnabled: true,
          orgAutoAcceptEmail: "cal.com",
        },
      });
      return team;
    });
  }

  async delete(teamId: Team["id"]) {
    return await this.prismaWriteClient.$transaction(async (prisma) => {
      await prisma.organizationSettings.delete({
        where: { organizationId: teamId },
      });
      return prisma.team.delete({ where: { id: teamId } });
    });
  }
}
