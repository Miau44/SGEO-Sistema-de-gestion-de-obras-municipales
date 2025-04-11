import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ListaParametrica } from './../entities/lista_parametrica.entity';
import { CreateListaParametricaDto, UpdateListaParametricaDto } from './../dto/lista_parametrica.dto';
import { ResponseService } from 'src/response.service';

@Injectable()
export class ListaParametricaService {
  constructor(
    @InjectRepository(ListaParametrica)
    private listaParametricaRepository: Repository<ListaParametrica>,
    private responseService: ResponseService,
  ) {}

  async findAll () {
    try {
      const qry = `
        SELECT * FROM sp_lista_parametrica('{
        "p_accion": "C1"
      }')`;
      const resp = await this.listaParametricaRepository.query(qry)
      return this.responseService.success(resp, 'Listado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findOne(id: number) {
    try {
      const qry = `
        SELECT * FROM sp_lista_parametrica('{
        "p_accion": "C2",
        "id": ${id}
      }')`;
      const resp = await this.listaParametricaRepository.query(qry);
      return this.responseService.success(resp[0], 'Listado correctamente')
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async create(data: CreateListaParametricaDto) {
    try {
      const qry = `
        SELECT * FROM sp_lista_parametrica('{
        "p_accion": "A",
        "desc_tipo": "${data.desc_tipo}",
        "usuario_registro": ${data.usuario_registro}
      }')`;
      const resp = await this.listaParametricaRepository.query(qry);
      return this.responseService.success(resp, 'Guardado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id: number, changes: UpdateListaParametricaDto) {
    try {
      const lista_parametrica = await this.findOne(id);
      if (lista_parametrica.statusCode === 200 || lista_parametrica.statusCode === 204) {
        const merge = lista_parametrica.data;
        this.listaParametricaRepository.merge(merge, changes);
        const qry = `
          SELECT * FROM sp_lista_parametrica('{
          "p_accion": "C",
          "id": ${id},
          "desc_tipo": "${merge.desc_tipo}",
          "usuario_registro": ${merge.usuario_registro}
        }')`;
        const resp = await this.listaParametricaRepository.query(qry);
        return this.responseService.success(resp, 'Actualizado correctamente');
      } else {
        throw Error(lista_parametrica.data);
      }
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async delete(id: number) {
    try {
      const qry = `
        SELECT * FROM sp_lista_parametrica('{
        "p_accion": "B",
        "id": ${id}
      }')`;
      await this.listaParametricaRepository.query(qry);
      return this.responseService.success(id, 'Eliminado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
