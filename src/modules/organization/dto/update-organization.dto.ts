import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateConferenceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

export class UpdateDistrictDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

export class UpdateChurchDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
