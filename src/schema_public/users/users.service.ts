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
  urlSeguridad = process.env.URL_SEGURIDAD2;
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

  async listaUsuariosSeguridad() {
    const endPoint = this.urlSeguridad + `persona/listaPersona`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    };
    try {
      const response = await fetch(endPoint, options);
      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }

      // Si llegó aquí, es que SI es un array. 
      // Lo retornamos directamente.
      const usuariosArray = await response.json();
      return usuariosArray;

    } catch (error) {
      console.error('Error al obtener lista de usuarios:', error);
      throw error;
    }

  }

  async buscarUsuariosSeguridad(filtro?: string) {
    console.log(filtro);

    const endPoint = this.urlSeguridad + `persona/listaPersonaBusqueda`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "nombrecompleto": filtro }),
    };
    try {
      const response = await fetch(endPoint, options);

      if (!response.ok) {
        const textoError = await response.text();
        console.error("Respuesta fallida del servidor (posible HTML):", textoError);
        throw new Error(`Error ${response.status}: No se recibió el array de usuarios`);
      }

      // Si llegó aquí, es que SI es un array. 
      // Lo retornamos directamente.
      const usuariosArray = await response.json();
      return usuariosArray;

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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
