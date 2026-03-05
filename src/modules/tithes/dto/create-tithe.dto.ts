import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTitheDto {
  @ApiProperty()
  @IsUUID('all')
  memberId: string;

  @ApiProperty()
  @IsUUID('all')
  churchId: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['TITHE', 'OFFERING', 'SPECIAL'] })
  @IsEnum(['TITHE', 'OFFERING', 'SPECIAL'])
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
