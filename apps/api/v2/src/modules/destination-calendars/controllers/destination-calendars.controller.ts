import { API_VERSIONS_VALUES } from "@/lib/api-versions";
import { GetUser } from "@/modules/auth/decorators/get-user/get-user.decorator";
import { ApiAuthGuard } from "@/modules/auth/guards/api-auth/api-auth.guard";
import { DestinationCalendarsInputBodyDto } from "@/modules/destination-calendars/inputs/destination-calendars.input";
import {
  DestinationCalendarsOutputDto,
  DestinationCalendarsOutputResponseDto,
} from "@/modules/destination-calendars/outputs/destination-calendars.output";
import { DestinationCalendarsService } from "@/modules/destination-calendars/services/destination-calendars.service";
import { UserWithProfile } from "@/modules/users/users.repository";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags as DocsTags } from "@nestjs/swagger";
import { plainToClass } from "class-transformer";

import { SUCCESS_STATUS } from "@calcom/platform-constants";

@Controller({
  path: "/v2/destination-calendars",
  version: API_VERSIONS_VALUES,
})
@DocsTags("Destination-Calendars")
export class DestinationCalendarsController {
  constructor(private readonly destinationCalendarService: DestinationCalendarsService) {}

  @Post("/")
  @UseGuards(ApiAuthGuard)
  async updateDestinationCalendars(
    @Body() input: DestinationCalendarsInputBodyDto,
    @GetUser() user: UserWithProfile
  ): Promise<DestinationCalendarsOutputResponseDto> {
    const { integration, externalId } = input;
    const updatedDestinationCalendar = await this.destinationCalendarService.updateDestinationCalendars(
      integration,
      externalId,
      user.id
    );

    return {
      status: SUCCESS_STATUS,
      data: plainToClass(DestinationCalendarsOutputDto, updatedDestinationCalendar, {
        strategy: "excludeAll",
      }),
    };
  }
}
