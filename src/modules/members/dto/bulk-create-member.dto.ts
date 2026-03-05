import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BulkMemberItem {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class BulkCreateMembersDto {
  @ApiProperty()
  @IsUUID('all')
  churchId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('all')
  householdId?: string;

  @ApiProperty({ type: [BulkMemberItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMemberItem)
  members: BulkMemberItem[];
}
