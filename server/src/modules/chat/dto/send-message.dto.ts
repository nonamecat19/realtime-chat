import {IsString, MaxLength, MinLength} from 'class-validator';

export class SendMessageDto {
  @IsString({message: 'Must be a string'})
  @MinLength(1, {message: 'Message must not be empty'})
  @MaxLength(200, {message: 'Message maximum length is 200 characters'})
  message: string;
}
