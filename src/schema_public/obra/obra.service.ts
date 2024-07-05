import { Injectable } from '@nestjs/common';
import { CreateObraDto } from './dto/create-obra.dto';
import { UpdateObraDto } from './dto/update-obra.dto';
import { CarpetaDto } from './dto/carpetaDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { ResponseService } from 'src/response.service';
import { Obra } from './entities/obra.entity';
import { log } from 'console';
import { EstructuraObraDto } from './dto/estructuraDto.dto';

@Injectable()
export class ObraService {



  constructor(@InjectRepository(Obra) private obraRepositorio: Repository<Obra>,
    private responseService: ResponseService, 
  ) { }


  async create(createObraDto: CreateObraDto) {
    try {
      const resultado = await this.obraRepositorio.save(createObraDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  findAll() {
  }

  findOne(id: number) {
    return `This action returns a #${id} obra`;
  }

  update(id: number, updateObraDto: UpdateObraDto) {
    return `This action updates a #${id} obra`;
  }

  remove(id: number) {
    return `This action removes a #${id} obra`;
  }


async listarObrasXUe(estructuraDto: EstructuraObraDto) {
  try {

    const query = `SELECT * FROM public.obra WHERE cod_ue =$1 `;

    const values =[estructuraDto.cod_ue]
    const resultado = await this.obraRepositorio.query(query, values);
    return this.responseService.success(resultado, "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
}






 /* async token() {
    //const url = process.env.URL_SIM+'wsToken';
    const url = 'http://localhost:3009/auth/login';

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: 'pruebas2',
        password: 'oegs134679'
      }),
    };
    const response = await fetch(url, options);
    const resultado = await response.json();
    return resultado
  }*/

 /* async create(createObraDto: CreateObraDto) {
    try {  
      const v_token = await this.autenticacion.login(
        {"usuario": "pruebas2",
        "password": "oegs134679"}
      )
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${v_token}`,
        },
        body: JSON.stringify({
          createObraDto
        }),
      };
      const response = await fetch(url, options);        
      const resultado = await this.obraRepositorio.save(createObraDto);

      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
*/

 /* async guardar(createObraDto: CreateObraDto) {
    //const v_token = await this.token();
    const url = 'http://localhost:3009/obra'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${v_token}`,
      },
      body: JSON.stringify({
        createObraDto
      }),

    };
    const response = await fetch(url, options);
    const resultado = await response.json();

  }
*/

}
