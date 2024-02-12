import { CalendarBusyTimesInput } from "@/ee/calendars/inputs/calendar-busy-times.input";
import { CalendarsService } from "@/ee/calendars/services/calendars";
import { GetUser } from "@/modules/auth/decorators/get-user/get-user.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token/access-token.guard";
import { Controller, Get, Logger, UseGuards, Body, Query } from "@nestjs/common";
import { User } from "@prisma/client";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { ApiResponse } from "@calcom/platform-types";
import { EventBusyDate } from "@calcom/types/Calendar";

@Controller({
  path: "ee/overlay-calendars",
  version: "2",
})
@UseGuards(AccessTokenGuard)
export class CalendarController {
  private readonly logger = new Logger("ee overlay calendars controller");

  constructor(private readonly overlayCalendarsService: CalendarsService) {}

  @Get("/busy-times")
  async getBusyTimes(
    @Query() queryParams: CalendarBusyTimesInput,
    @GetUser() user: User
  ): Promise<ApiResponse<EventBusyDate[]>> {
    const { loggedInUsersTz, dateFrom, dateTo, calendarsToLoad } = queryParams;
    if (!dateFrom || !dateTo) {
      return {
        status: SUCCESS_STATUS,
        data: [],
      };
    }

    const busyTimes = await this.overlayCalendarsService.getBusyTimes(
      calendarsToLoad,
      user.id,
      dateFrom,
      dateTo,
      loggedInUsersTz
    );

    return {
      status: SUCCESS_STATUS,
      data: busyTimes,
    };
  }
}
