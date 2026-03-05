import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsUUID('all')
  eventId: string;

  @ApiProperty()
  @IsUUID('all')
  memberId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
