import { ApiProperty as DocsProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from "class-validator";

import { SchedulingType } from "@calcom/platform-enums";

import { BookerLayouts_2024_06_14 } from "./booker-layouts.input";
import type { BookingField_2024_06_14 } from "./booking-fields.input";
import { ValidateBookingFields_2024_06_14 } from "./booking-fields.input";
import { BookingLimitsCount_2024_06_14, ValidateBookingLimistsCount } from "./booking-limits-count.input";
import {
  BookingLimitsDuration_2024_06_14,
  ValidateBookingLimistsDuration,
} from "./booking-limits-duration.input";
import type { BookingWindow_2024_06_14 } from "./booking-window.input";
import { ValidateBookingWindow } from "./booking-window.input";
import { EventTypeColor_2024_06_14 } from "./event-type-color.input";
import { ValidateLocations_2024_06_14 } from "./locations.input";
import type { Location_2024_06_14 } from "./locations.input";
import { Recurrence_2024_06_14 } from "./recurrence.input";
import { RequiresConfirmation_2024_06_14, ValidateRequiresConfirmation } from "./requires-confirmation.input";
import { Seats_2024_06_14 } from "./seats.input";

export const CREATE_EVENT_LENGTH_EXAMPLE = 60;
export const CREATE_EVENT_TITLE_EXAMPLE = "Learn the secrets of masterchief!";
export const CREATE_EVENT_DESCRIPTION_EXAMPLE =
  "Discover the culinary wonders of the Argentina by making the best flan ever!";

export class BaseCreateEventTypeInput_2024_06_14 {
  @IsOptional()
  @IsInt()
  @Min(1)
  lengthInMinutes?: number;

  @IsOptional()
  @IsString()
  @DocsProperty({ example: CREATE_EVENT_TITLE_EXAMPLE })
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @DocsProperty({ example: CREATE_EVENT_DESCRIPTION_EXAMPLE })
  description?: string;

  @IsOptional()
  @ValidateLocations_2024_06_14()
  locations?: Location_2024_06_14[];

  @IsOptional()
  @ValidateBookingFields_2024_06_14()
  bookingFields?: BookingField_2024_06_14[];

  @IsBoolean()
  @IsOptional()
  disableGuests?: boolean;

  @IsInt()
  @IsOptional()
  slotInterval?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  minimumBookingNotice?: number;

  @IsInt()
  @IsOptional()
  beforeEventBuffer?: number;

  @IsInt()
  @IsOptional()
  afterEventBuffer?: number;

  @IsInt()
  @IsOptional()
  scheduleId?: number;

  @IsOptional()
  @Type(() => BookingLimitsCount_2024_06_14)
  @ValidateBookingLimistsCount()
  bookingLimitsCount?: BookingLimitsCount_2024_06_14;

  @IsOptional()
  @IsBoolean()
  onlyShowFirstAvailableSlot?: boolean;

  @IsOptional()
  @Type(() => BookingLimitsDuration_2024_06_14)
  @ValidateBookingLimistsDuration()
  bookingLimitsDuration?: BookingLimitsDuration_2024_06_14;

  @IsOptional()
  @ValidateBookingWindow()
  bookingWindow?: BookingWindow_2024_06_14;

  @IsOptional()
  @IsInt()
  @Min(1)
  offsetStart?: number;

  @IsOptional()
  @Type(() => BookerLayouts_2024_06_14)
  bookerLayouts?: BookerLayouts_2024_06_14;

  @IsOptional()
  @ValidateRequiresConfirmation()
  @Type(() => RequiresConfirmation_2024_06_14)
  requiresConfirmation?: RequiresConfirmation_2024_06_14;

  @ValidateNested()
  @Type(() => Recurrence_2024_06_14)
  recurrence?: Recurrence_2024_06_14;

  @IsOptional()
  @IsBoolean()
  requiresBookerEmailVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  hideCalendarNotes?: boolean;

  @IsOptional()
  @IsBoolean()
  lockTimeZoneToggleOnBookingPage?: boolean;

  @IsOptional()
  @Type(() => EventTypeColor_2024_06_14)
  eventTypeColor?: EventTypeColor_2024_06_14;

  @IsOptional()
  @Type(() => Seats_2024_06_14)
  seats?: Seats_2024_06_14;
}
export class CreateEventTypeInput_2024_06_14 extends BaseCreateEventTypeInput_2024_06_14 {
  @IsInt()
  @Min(1)
  @DocsProperty({ example: CREATE_EVENT_LENGTH_EXAMPLE })
  override lengthInMinutes!: number;

  @IsString()
  @DocsProperty({ example: CREATE_EVENT_TITLE_EXAMPLE })
  override title!: string;

  @IsString()
  override slug!: string;
}

export enum HostPriority {
  lowest = "lowest",
  low = "low",
  medium = "medium",
  high = "high",
  highest = "highest",
}
export class Host {
  @IsInt()
  userId!: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean = false;

  @IsEnum(HostPriority)
  @IsOptional()
  priority?: keyof typeof HostPriority = "medium";
}

export class CreateTeamEventTypeInput_2024_06_14 extends CreateEventTypeInput_2024_06_14 {
  @Transform(({ value }) => {
    if (value === "collective") {
      return SchedulingType.COLLECTIVE;
    }
    if (value === "roundRobin") {
      return SchedulingType.ROUND_ROBIN;
    }
    if (value === "managed") {
      return SchedulingType.MANAGED;
    }
    return value;
  })
  @IsEnum(SchedulingType)
  @DocsProperty()
  schedulingType!: keyof typeof SchedulingType;

  @ValidateNested({ each: true })
  @Type(() => Host)
  @IsArray()
  @DocsProperty()
  hosts!: Host[];

  @IsBoolean()
  @IsOptional()
  @DocsProperty()
  assignAllTeamMembers?: boolean;
}
