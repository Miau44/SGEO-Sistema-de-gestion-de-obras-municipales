import { Injectable } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';

import { ResponseService } from 'src/response.service';
import { Ficha } from './entities/ficha.entity';
import { EstructuraFichaDto } from './dto/estructura-fichaDto';
import { TipoObraModDto } from './dto/tipo-obra-modalidad.dto';

@Injectable()
export class FichaService {

  constructor(@InjectRepository(Ficha) private obraRepositorio: Repository<Ficha>,
  private responseService: ResponseService, 
) { }



  async create(createFichaDto: CreateFichaDto) {
    try {
      const resultado = await this.obraRepositorio.save(createFichaDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }  }

  findAll() {
    return `This action returns all ficha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ficha`;
  }

  async update(id: number, updateFichaDto: UpdateFichaDto) {
    try {
      const resultado = await this.obraRepositorio.update(id, updateFichaDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} ficha`;
  }


  async listarFichaXUe(estructuraFichaDto: EstructuraFichaDto) {
    try {  
    /*  const query = `SELECT * FROM public.Ficha as f
      INNER JOIN (SELECT  desc_cod_ue, nombre_ue, gestion from estructura_organizacional
      WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
      WHERE f.desc_cod_ue = ${estructuraFichaDto.desc_cod_ue} ORDER BY fecha_registro DESC `;*/
      const query = ` SELECT * FROM public.Ficha as f
      INNER JOIN (SELECT  desc_cod_ue, nombre_ue, gestion from estructura_organizacional
      WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
      INNER JOIN  solicitud_designacion sd ON f.id_ficha = sd.id_ficha
      INNER JOIN persona p ON sd.id_persona = p.id_persona
      WHERE f.desc_cod_ue = ${estructuraFichaDto.desc_cod_ue} ORDER BY f.fecha_registro DESC `;
  
      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  
  async listarFichaXUeValidadas(estructuraFichaDto: EstructuraFichaDto) {
    try {
  
      const query = `SELECT * FROM public.Ficha as f
      INNER JOIN (SELECT  desc_cod_ue, nombre_ue, gestion from estructura_organizacional
      WHERE  gestion =${estructuraFichaDto.gestion} GROUP BY desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
      WHERE f.desc_cod_ue = ${estructuraFichaDto.desc_cod_ue}  AND 
      f.id_ficha NOT IN(
      SELECT f.id_ficha FROM public.Ficha as f
      INNER JOIN  solicitud_designacion sd ON f.id_ficha = sd.id_ficha)
      ORDER BY fecha_registro ASC `;

      const resultado = await this.obraRepositorio.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  


  actualizar(id_ficha: number, tipoObraModDto: TipoObraModDto) {
    this.obraRepositorio.update(id_ficha, tipoObraModDto);
    return {
      mensaje:'Actualizado con éxito',
      estado: true,   
      data: id_ficha  
    }
  }  

}
