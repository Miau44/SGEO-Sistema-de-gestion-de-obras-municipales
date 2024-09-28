import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ListaTabla } from './entities/lista_tabla.entity';
import { CreateListaTablaDto, UpdateListaTablaDto } from './dto/lista_tabla.dto';
import { ResponseService } from 'src/response.service';

@Injectable()
export class ListaTablaService {
  constructor(
    @InjectRepository(ListaTabla)
    private listaTablaRepository: Repository<ListaTabla>,
    private responseService: ResponseService,
  ) {}

  async findAll () {
    try {
      const qry = `
        SELECT * FROM sp_lista_tabla('{
        "p_accion": "C1"
      }')`;
      const resp = await this.listaTablaRepository.query(qry)
      return this.responseService.success(resp, 'Listado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findOne(id_lista_tabla: number) {
    try {
      const qry = `
        SELECT * FROM sp_lista_tabla('{
        "p_accion": "C2",
        "id_lista_tabla": ${id_lista_tabla}
      }')`;
      const resp = await this.listaTablaRepository.query(qry);
      return this.responseService.success(resp[0], 'Listado correctamente')
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async create(data: CreateListaTablaDto) {
    try {
      const qry = `
        SELECT * FROM sp_lista_tabla('{
        "p_accion": "A",
        "id_tipo": ${data.id_tipo},
        "desc_tipo": "${data.desc_tipo}",
        "usuario_registro": ${data.usuario_registro}
      }')`;
      const resp = await this.listaTablaRepository.query(qry);
      return this.responseService.success(resp, 'Guardado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async update(id_lista_tabla: number, changes: UpdateListaTablaDto) {
    try {
      const lista_tabla = await this.findOne(id_lista_tabla);
      const merge = lista_tabla.data;
      console.log('aa')
      this.listaTablaRepository.merge(merge, changes);
      console.log('asdasda')
      const qry = `
        SELECT * FROM sp_lista_tabla('{
        "p_accion": "C",
        "id_lista_tabla": ${id_lista_tabla},
        "desc_tipo": "${merge.desc_tipo}",
        "usuario_registro": ${merge.usuario_registro}
      }')`;
      console.log('asdasda')
      const resp = await this.listaTablaRepository.query(qry);
      return this.responseService.success(resp, 'Actualizado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async delete(id_lista_tabla: number) {
    try {
      const qry = `
        SELECT * FROM sp_lista_tabla('{
        "p_accion": "B",
        "id_lista_tabla": ${id_lista_tabla}
      }')`;
      await this.listaTablaRepository.query(qry);
      return this.responseService.success(id_lista_tabla, 'Eliminado correctamente');
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
