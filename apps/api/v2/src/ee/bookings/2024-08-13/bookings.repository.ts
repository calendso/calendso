import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BookingsRepository_2024_08_13 {
  constructor(private readonly dbRead: PrismaReadService, private readonly dbWrite: PrismaWriteService) {}

  async getById(id: number) {
    return this.dbRead.prisma.booking.findUnique({
      where: {
        id,
      },
    });
  }

  async getByUid(bookingUid: string) {
    return this.dbRead.prisma.booking.findUnique({
      where: {
        uid: bookingUid,
      },
    });
  }

  async getByIdWithAttendeesAndUser(id: number) {
    return this.dbRead.prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        attendees: true,
        user: true,
      },
    });
  }

  async getByUidWithAttendeesAndUser(uid: string) {
    return this.dbRead.prisma.booking.findUnique({
      where: {
        uid,
      },
      include: {
        attendees: true,
        user: true,
      },
    });
  }

  async getRecurringByUidWithAttendeesAndUser(uid: string) {
    return this.dbRead.prisma.booking.findMany({
      where: {
        recurringEventId: uid,
      },
      include: {
        attendees: true,
        user: true,
      },
    });
  }

  async getByFromReschedule(fromReschedule: string) {
    return this.dbRead.prisma.booking.findFirst({
      where: {
        fromReschedule,
      },
      include: {
        attendees: true,
        user: true,
      },
    });
  }
}
