import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDistrictDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsUUID()
  conferenceId: string;
}
