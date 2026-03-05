import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChurchDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsUUID()
  districtId: string;
}
