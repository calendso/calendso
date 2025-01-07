import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { Prisma } from "@calcom/prisma/client";

import { PrismaWriteService } from "../../prisma/prisma-write.service";

type OOOInputData = Omit<Prisma.OutOfOfficeEntryCreateInput, "user" | "toUser" | "reason" | "uuid"> & {
  toUserId?: number;
  userId: number;
  reasonId?: number;
};

@Injectable()
export class UserOOORepository {
  constructor(private readonly dbRead: PrismaReadService, private readonly dbWrite: PrismaWriteService) {}

  async createUserOOO(data: OOOInputData) {
    const uuid = uuidv4();
    return this.dbWrite.prisma.outOfOfficeEntry.create({
      data: { ...data, uuid },
      include: { reason: true },
    });
  }

  async updateUserOOO(oooId: number, data: Partial<OOOInputData>) {
    return this.dbWrite.prisma.outOfOfficeEntry.update({
      where: { id: oooId },
      data,
      include: { reason: true },
    });
  }

  async getUserOOOById(oooId: number) {
    return this.dbRead.prisma.outOfOfficeEntry.findFirst({
      where: { id: oooId },
      include: { reason: true },
    });
  }

  async getUserOOOPaginated(userId: number, skip: number, take: number) {
    return this.dbRead.prisma.outOfOfficeEntry.findMany({
      where: { userId },
      skip,
      take,
      include: { reason: true },
    });
  }

  async deleteUserOOO(oooId: number) {
    return this.dbWrite.prisma.outOfOfficeEntry.delete({
      where: { id: oooId },
      include: { reason: true },
    });
  }
}
