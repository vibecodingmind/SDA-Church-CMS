import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  resource: string;

  @IsString()
  @MinLength(2)
  action: string;

  @IsString()
  @IsOptional()
  description?: string;
}
