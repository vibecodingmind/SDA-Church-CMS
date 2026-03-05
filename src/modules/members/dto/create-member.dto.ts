import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { MemberStatus } from '@prisma/client';

export class CreateMemberDto {
  @IsOptional()
  @IsUUID('all')
  churchId?: string;

  @IsOptional()
  @IsUUID('all')
  householdId?: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsDateString()
  membershipDate?: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;
}
