import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignMemberDto {
  @ApiProperty()
  @IsUUID('all')
  memberId: string;

  @ApiProperty({ required: false, enum: ['LEADER', 'MEMBER'] })
  @IsOptional()
  @IsString()
  role?: string;
}
