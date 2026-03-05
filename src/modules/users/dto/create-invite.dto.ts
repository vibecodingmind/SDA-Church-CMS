import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'newuser@church.org' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  churchId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  districtId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  conferenceId?: string;
}
