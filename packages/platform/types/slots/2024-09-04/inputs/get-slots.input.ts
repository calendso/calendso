import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsTimeZone,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ArrayMinSize,
} from "class-validator";

class GetAvailableSlotsInput_2024_09_04 {
  @IsDateString()
  @ApiProperty({
    type: String,
    description: `
      Time starting from which available slots should be checked.
    
      Must be in UTC timezone as ISO 8601 datestring.
      
      You can pass date without hours which defaults to start of day or specify hours:
      2024-08-13 (will have hours 00:00:00 aka at very beginning of the date) or you can specify hours manually like 2024-08-13T09:00:00Z
      `,
    example: "2050-09-05",
  })
  start!: string;

  @IsDateString()
  @ApiProperty({
    type: String,
    description: `
      Time until which available slots should be checked.
      
      Must be in UTC timezone as ISO 8601 datestring.
      
      You can pass date without hours which defaults to end of day or specify hours:
      2024-08-20 (will have hours 23:59:59 aka at the very end of the date) or you can specify hours manually like 2024-08-20T18:00:00Z`,
    example: "2050-09-06",
  })
  end!: string;

  @IsTimeZone()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: "Time zone in which the available slots should be returned. Defaults to UTC.",
    example: "Europe/Rome",
  })
  timeZone?: string;
}

export class ById_2024_09_04 extends GetAvailableSlotsInput_2024_09_04 {
  @Transform(({ value }: { value: string }) => value && parseInt(value))
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "The ID of the event type for which available slots should be checked.",
    example: "100",
  })
  eventTypeId!: number;
}

export class BySlug_2024_09_04 extends GetAvailableSlotsInput_2024_09_04 {
  @IsString()
  @ApiProperty({
    type: String,
    description: "The slug of the event type for which available slots should be checked.",
    example: "event-type-slug",
  })
  eventTypeSlug!: string;
}

export class ByUsernames_2024_09_04 extends GetAvailableSlotsInput_2024_09_04 {
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((username: string) => username.trim());
    }
    return value;
  })
  @IsArray()
  @ArrayMinSize(2, { message: "The array must contain at least 2 elements." })
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: `The usernames for which available slots should be checked.
      
      Checking slots by usernames is used mainly for dynamic event where there is no specific event but we just want to know when are 2 or more people available.
      
      Must contain at least 2 usernames e.g. ?usernames=alice,bob`,
    example: ["username1", "username2"],
  })
  usernames!: string[];

  @Transform(({ value }: { value: string }) => value && parseInt(value))
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    type: Number,
    description:
      "Duration of the intended meeting in minutes. Defaults to 30, meaning that returned slots will be each 30 minutes long.",
    example: "60",
  })
  duration?: number;
}
