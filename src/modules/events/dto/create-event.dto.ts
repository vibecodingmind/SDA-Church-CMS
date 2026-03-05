import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsUUID('all')
  churchId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  eventDate: string;

  @ApiProperty({ enum: ['SERVICE', 'MEETING', 'PROGRAM'] })
  @IsEnum(['SERVICE', 'MEETING', 'PROGRAM'])
  eventType: string;
}
