import { GetBusyTimesOutput } from "@/ee/calendars/outputs/busy-times.output";
import { ConnectedCalendarsOutput } from "@/ee/calendars/outputs/connected-calendars.output";
import { CalendarsService } from "@/ee/calendars/services/calendars.service";
import { GetUser } from "@/modules/auth/decorators/get-user/get-user.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token/access-token.guard";
import { UserWithProfile } from "@/modules/users/users.repository";
import { Controller, Get, UseGuards, Query, HttpStatus, HttpCode, Req } from "@nestjs/common";
import { ApiTags as DocsTags } from "@nestjs/swagger";
import { Request } from "express";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { CalendarBusyTimesInput } from "@calcom/platform-types";

@Controller({
  path: "/calendars",
  version: "2",
})
@UseGuards(AccessTokenGuard)
@DocsTags("Calendars")
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get("/busy-times")
  async getBusyTimes(
    @Query() queryParams: CalendarBusyTimesInput,
    @GetUser() user: UserWithProfile
  ): Promise<GetBusyTimesOutput> {
    const { loggedInUsersTz, dateFrom, dateTo, calendarsToLoad } = queryParams;
    if (!dateFrom || !dateTo) {
      return {
        status: SUCCESS_STATUS,
        data: [],
      };
    }

    const busyTimes = await this.calendarsService.getBusyTimes(
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

  @Get("/")
  async getCalendars(@GetUser("id") userId: number): Promise<ConnectedCalendarsOutput> {
    const calendars = await this.calendarsService.getCalendars(userId);

    return {
      status: SUCCESS_STATUS,
      data: calendars,
    };
  }

  @Get("/office365/connect")
  @HttpCode(HttpStatus.OK)
  async redirect(
    @Req() req: Request
  ): Promise<{ status: typeof SUCCESS_STATUS; data: { authUrl: Promise<string> } }> {
    const redirectUrl = this.calendarsService.getRedirectUrl(req);

    return {
      status: SUCCESS_STATUS,
      data: { authUrl: redirectUrl },
    };
  }

  @Get("/office365/save")
  @HttpCode(HttpStatus.OK)
  async save(): Promise<{ status: "success" }> {
    return {
      status: SUCCESS_STATUS,
    };
  }

  @Get("/office365/check")
  @HttpCode(HttpStatus.OK)
  async check(): Promise<{ status: "success" }> {
    return {
      status: SUCCESS_STATUS,
    };
  }
}
