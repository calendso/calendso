import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

import { ERROR_STATUS } from "@calcom/platform-constants";
import { SUCCESS_STATUS } from "@calcom/platform-constants";

export class BaseOutputDTO {
  @ApiProperty({ example: SUCCESS_STATUS, enum: [SUCCESS_STATUS, ERROR_STATUS] })
  @IsEnum([SUCCESS_STATUS, ERROR_STATUS])
  status!: typeof SUCCESS_STATUS | typeof ERROR_STATUS;
}
