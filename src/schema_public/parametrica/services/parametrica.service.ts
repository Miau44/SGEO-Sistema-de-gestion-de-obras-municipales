import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Parametrica } from './../entities/parametrica.entity';
import { CreateParametricaDto, UpdateParametricaDto } from './../dto/parametrica.dto';
import { FiltrosDto } from './../dto/filtrosDto.dto';
import { ResponseService } from 'src/response.service';

@Injectable()
export class ParametricaService {

  constructor(
    @InjectRepository(Parametrica) 
    private parametricaRepo: Repository<Parametrica>, 
    private responseService: ResponseService
  ) {}

  async create(createParametricaDto: CreateParametricaDto) {
    try {
      let datos;
      let detalle = JSON.stringify(createParametricaDto?.detalle);
      if (detalle[0] === '{' && detalle[detalle.length - 1] === '}') {
        datos = {
          ...createParametricaDto,
          detalle
        };
      } else {
        datos = createParametricaDto
      }
      const qry = `
        SELECT * FROM sp_parametrica('{
        "p_accion": "A",
        "id_tipo": ${datos.id_tipo},
        "desc_subtipo": "${datos.desc_subtipo}",
        "detalle": "${datos.detalle}",
        "id_padre": ${datos.id_padre},
        "id_protegido": ${datos.id_protegido},
        "usuario_registro": ${datos.usuario_registro}
      }')`;
      const resultado = await this.parametricaRepo.query(qry);
      return this.responseService.success(resultado, "Registrado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  async findAll() {
    try {
      const qry = `
        SELECT * FROM sp_parametrica('{
        "p_accion": "C1"
      }')`;
      const resultado = await this.parametricaRepo.query(qry)
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findAllByLista(id: number) {
    try {
      const qry = `
        SELECT * FROM sp_parametrica('{
        "p_accion": "C3",
        "id_tipo": ${id}
      }')`;
      const resultado = await this.parametricaRepo.query(qry)
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findOne(id: number) {
    try {
      let datos;
      let detalle = '';
      const qry = `
        SELECT * FROM sp_parametrica('{
        "p_accion": "C2",
        "id": ${id}
      }')`;
      const aux = await this.parametricaRepo.query(qry);
      const resultado = aux[0]
      // const detalleBase = resultado?.detalle?resultado?.detalle:'';
      // if (detalleBase[0]==='{' && detalleBase[detalleBase.length-1]==='}'){
      //   detalle = JSON.parse(detalleBase);
      //   datos = {
      //     ...resultado,
      //     detalle,
      //   }
      // } else {
      //   datos = resultado;
      // }
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id: number, changes: UpdateParametricaDto) {
    try {
      const parametrica = await this.findOne(id);
      if (parametrica.statusCode === 200 || parametrica.statusCode === 204) {
        let merge = parametrica.data;
        // let detalle = JSON.stringify(changes?.detalle);
        // if (detalle[0] === '{' && detalle[detalle.length - 1] === '}') {
        //   merge = {
        //     ...changes,
        //     detalle
        //   };
        // } else {
        //   merge = changes;
        // }
        this.parametricaRepo.merge(merge, changes);
        const qry = `
          SELECT * FROM sp_parametrica('{
          "p_accion": "C",
          "id": ${id},
          "id_tipo": ${merge.id_tipo},
          "desc_subtipo": "${merge.desc_subtipo}",
          "detalle": "${merge.detalle}",
          "id_padre": ${merge.id_padre},
          "id_protegido": ${merge.id_protegido},
          "usuario_registro": ${merge.usuario_registro}
        }')`;
        const resp = await this.parametricaRepo.query(qry);
        return this.responseService.success(resp, 'Actualizado correctamente');
      } else {
        throw Error(parametrica.data);
      }
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async remove(id: number) {
    try {
      const qry = `
        SELECT * FROM sp_parametrica('{
        "p_accion": "B",
        "id": ${id}
      }')`;
      await this.parametricaRepo.query(qry);
      return this.responseService.success(id, 'Eliminado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listarXTipo(filtrosDto: FiltrosDto): Promise<any> {
    try {
      const query = ` SELECT * FROM parametrica WHERE ${filtrosDto.campo} = $1 AND id_estado=1; `;
      const values = [filtrosDto.id];
      const resultado = await this.parametricaRepo.query(query, values);
      return this.responseService.success(resultado, "Listado Correctamente")
    } catch (error) {
      return this.responseService.error(error);
    }
  }






}
