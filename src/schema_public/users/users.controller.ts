import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('usuario')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('listarUsuariosSeguridad')
  listarUsuariosSeguridad(
    @Body () body:{ idSistema?:number}
  ) {
    const idSistema=body.idSistema ?? 18;

    return this.usersService.listaUsuariosSeguridad(idSistema);
  }


  @Post('buscarUsuariosSeguridad')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {

        filtro: { type: 'string' },
        idSistema: {type : 'number'}
      },
      required: ['gestion', 'codigoue'],
    },
  })
  buscarUsuariosSeguridad(@Body() body: { filtro?: string; idSistema?: number }) {
    const { filtro , idSistema } = body;
    return this.usersService.buscarUsuariosSeguridad(filtro, idSistema);
  }

 @Post('listarRolesSeguridad')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      idSistema: {
        type: 'number',
        example: 18
      }
    }
  }
})
listarRolesSeguridad(
  @Body() body: { idSistema?: number }
) {

  const idSistema = body.idSistema ?? 18;

  return this.usersService.listarRolesSeguridad(idSistema);

}
listarRolesUsuarioSeguridad(
  @Body() body: { id_usuario?: number; idSistema?: number }
) {

  const { id_usuario, idSistema } = body;

  return this.usersService.listarRolesUsuarioSeguridad(
    id_usuario,
    idSistema
  );
}

  @Put('quitarRol')
    @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_usuario: { type: 'number' },
        idRol: { type: 'number' },
        idUsuarioRol: { type: 'number' },
        idUsuarioRegistro: { type: 'number' },
      },
      required: ['gestion', 'codigoue'],
    },
  })
  async quitarRol(@Body() body: { idUsuario: number; idRol: number; idUsuarioRol: number;idUsuarioRegistro:number }) {
    const { idUsuario, idRol, idUsuarioRol,idUsuarioRegistro } = body;
    return this.usersService.quitarRol(idUsuario, idRol, idUsuarioRol,idUsuarioRegistro);
  }

  @Put('asignarRol')
      @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_usuario: { type: 'number' },
        idRol: { type: 'number' },
        idUsuarioRol: { type: 'number' },
        idUsuarioRegistro: { type: 'number' },
      },
      required: ['gestion', 'codigoue'],
    },
  })
  async asignarRol(@Body() body: { idUsuario: number; idRol: number; idUsuarioRol: number;idUsuarioRegistro:number }) {
    const { idUsuario, idRol, idUsuarioRol,idUsuarioRegistro } = body;
    return this.usersService.asignarRol(idUsuario, idRol, idUsuarioRegistro,idUsuarioRol);
  }
}
