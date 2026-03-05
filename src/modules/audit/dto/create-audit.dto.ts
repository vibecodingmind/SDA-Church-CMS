import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  userId: string;

  @IsString()
  action: string;

  @IsString()
  resource: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
