import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('usuario')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('listarUsuariosSeguridad')
  listarUsuariosSeguridad() {
     
    return this.usersService.listaUsuariosSeguridad();
  }

  @Post('buscarUsuariosSeguridad')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        
        filtro: { type: 'string' },
      },
      required: ['gestion', 'codigoue'],
    },
  })
  buscarUsuariosSeguridad (@Body() body: { filtro?: string }) {
     const { filtro } = body;
    return this.usersService.buscarUsuariosSeguridad(filtro);
  }
}
