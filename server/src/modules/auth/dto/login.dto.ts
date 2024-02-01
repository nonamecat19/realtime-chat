import {IsString, Matches, MinLength} from 'class-validator';

export class LoginDto {
  @MinLength(3, {message: 'Nickname should be at least 3 characters'})
  @Matches(/^[a-zA-Z0-9]+$/, {message: 'Nickname should not contain special symbols'})
  @IsString({message: 'Nickname must be a string'})
  login: string;

  @MinLength(8, {message: 'Password should be at least 8 characters'})
  @IsString({message: 'Password must be a string'})
  password: string;
}
