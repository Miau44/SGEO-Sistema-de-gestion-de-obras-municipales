import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/registrer-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth , ApiTags} from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags('users')
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}


 @Post('register')
 registerUser(@Body() userObject:RegisterAuthDto){
  console.log(({body:userObject}));
  return this.authService.register(userObject)
 }

 @Post('/login')
 //login(@Body() logindto:LoginAuthDto):Promise<{token:string}>{  
  loginUser(@Body() logindto:LoginAuthDto){
    return this.authService.login(logindto)
 }

 /* @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }*/
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }*/

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
