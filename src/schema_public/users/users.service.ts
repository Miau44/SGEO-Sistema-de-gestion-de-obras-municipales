import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  urlSeguridad = process.env.URL_SEGURIDAD_ROLES;
  idSistema = process.env.ID_SISTEMA_SEGURIDAD;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {

  }

  async getAllUsers() {
    const users = this.usersRepository.find();
    return users;
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
    if (user) {
      return user;
    }
    throw new NotFoundException('Could not find the user');
  }

  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.usersRepository.create(createUserDto);
    await this.usersRepository.save({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
    });
    return newUser;
  }

  async listaUsuariosSeguridad(idSistema: number) {
    const endPoint = this.urlSeguridad + `persona/listaPersona`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idSistema:idSistema
      }),
    };
    try {
      const response = await fetch(endPoint, options);
      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }
      const usuariosArray = await response.json();
      return usuariosArray;

    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }

  }

  async buscarUsuariosSeguridad(filtro?: string , idSistema?:number) {
    const endPoint = this.urlSeguridad + `persona/listaPersonaBusqueda`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "nombrecompleto": filtro,
        idSistema:idSistema
       }),
    };
    try {
      const response = await fetch(endPoint, options);

      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }
      const usuariosArray = await response.json();
      return usuariosArray;

    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }
  }

  async listarRolesSeguridad() {
    const endPoint = this.urlSeguridad + `rol/listaSistemaRolexterno`;
    console.log("idSistema",this.idSistema);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "id_sistema": this.idSistema }),
    };
    try {
      const response = await fetch(endPoint, options);
      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }
      return await response.json();

    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }
  }

  async listarRolesUsuarioSeguridad(
  id_usuario: number | undefined,
  idSistema ?: number
) {

  const endPoint = this.urlSeguridad + `usuarioRol/listaRolUsuario`;

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_sistema: idSistema,
      id_usuario: id_usuario
    }),
  };

  try {
    const response = await fetch(endPoint, options);

    if (!response.ok) {
      const textoError = await response.text();
      console.error("Respuesta fallida del servidor:", textoError);
      throw new Error(`Error ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error al obtener lista de usuarios:', error);
    throw error;
  }
}

  async quitarRol(idUsuario: number, idRol: number, idUsuarioRol: number, idUsuarioRegistro: number) {
    const endPoint = this.urlSeguridad + `usuarioRol/` + idUsuarioRol;
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idRol: idRol,
        idUsuario: idUsuario,
        idEstado: 2,
        usuarioRegistro: idUsuarioRegistro
      })
    };
    try {
      const response = await fetch(endPoint, options);
      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }
  }

  async asignarRol(idUsuario: number, idRol: number, idUsuarioRegistro: number, idUsuarioRol?: number) {
    const endPoint =(idUsuarioRol!=null)?this.urlSeguridad + `usuarioRol/` + idUsuarioRol:this.urlSeguridad + `usuarioRol`;
    const metodo = (idUsuarioRol!=null)?'PUT':'POST';
    const options = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idRol: idRol,
        idUsuario: idUsuario,
        idEstado: 1,
        usuarioRegistro: idUsuarioRegistro
      })
    };
    try {
      const response = await fetch(endPoint, options);
      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }
}
