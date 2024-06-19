import { PartialType } from '@nestjs/swagger';
import { LoginAuthDto } from './login-auth.dto';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAuthDto extends PartialType(LoginAuthDto){
//export class RegisterAuthDto {
    @IsNotEmpty()
    @IsString()
    usuario!: string;
  
  /*  @IsNotEmpty()
    @IsEmail({}, { message: 'Please enter correct email' })
    email!: string;*/
  
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;
  

}