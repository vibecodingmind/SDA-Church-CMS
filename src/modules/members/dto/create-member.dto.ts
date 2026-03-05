import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsUUID('all')
  churchId?: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
