import {IsBoolean, IsNumber} from 'class-validator';

export class SetStatusDto {
  @IsNumber()
  userId: number;

  @IsBoolean()
  status: boolean;
}
