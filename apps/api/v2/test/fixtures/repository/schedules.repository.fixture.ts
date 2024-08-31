import { TestingModule } from "@nestjs/testing";
import { Schedule } from "@prisma/client";
import { PrismaReadService } from "src/modules/prisma/prisma-read.service";
import { PrismaWriteService } from "src/modules/prisma/prisma-write.service";

import { Prisma } from "@calcom/prisma/client";

export class SchedulesRepositoryFixture {
  private prismaReadClient: PrismaReadService["prisma"];
  private prismaWriteClient: PrismaWriteService["prisma"];

  constructor(private readonly module: TestingModule) {
    this.prismaReadClient = module.get(PrismaReadService).prisma;
    this.prismaWriteClient = module.get(PrismaWriteService).prisma;
  }

  async create(schedule: Prisma.ScheduleCreateArgs["data"]) {
    return this.prismaWriteClient.schedule.create({ data: schedule });
  }

  async getById(scheduleId: Schedule["id"]) {
    return this.prismaReadClient.schedule.findFirst({ where: { id: scheduleId } });
  }

  async deleteById(scheduleId: Schedule["id"]) {
    return this.prismaWriteClient.schedule.delete({ where: { id: scheduleId } });
  }

  async deleteAvailabilities(scheduleId: Schedule["id"]) {
    return this.prismaWriteClient.availability.deleteMany({ where: { scheduleId } });
  }
}
