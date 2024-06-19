

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
 /* @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })*/
  usuario!: string;

  /*@IsNotEmpty()
  @IsString()
  @MinLength(6)*/
  password!: string;
}
