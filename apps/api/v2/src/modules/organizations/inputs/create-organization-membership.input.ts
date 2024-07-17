import { MembershipRole } from "@prisma/client";
import { IsBoolean, IsOptional, IsEnum, IsInt } from "class-validator";

export class CreateOrgMembershipDto {
  @IsInt()
  readonly teamId!: number;

  @IsInt()
  readonly userId!: number;

  @IsOptional()
  @IsBoolean()
  readonly accepted?: boolean = false;

  @IsEnum(MembershipRole)
  readonly role: MembershipRole = MembershipRole.MEMBER;

  @IsOptional()
  @IsBoolean()
  readonly disableImpersonation?: boolean = false;
}
