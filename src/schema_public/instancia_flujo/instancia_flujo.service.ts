import { Injectable } from '@nestjs/common';
import { CreateInstanciaFlujoDto } from './dto/create-instancia_flujo.dto';
import { UpdateInstanciaFlujoDto } from './dto/update-instancia_flujo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { InstanciaFlujo } from './entities/instancia_flujo.entity';
import { InstanciaTarea } from '../instancia_tarea/entities/instancia_tarea.entity';
import { AvanzarDto } from './dto/avanzar.dto';
import { Transicion } from '../transicion/entities/transicion.entity';

import { InternalServerErrorException } from '@nestjs/common';
import { log } from 'console';





@Injectable()
export class InstanciaFlujoService {

  constructor(
    @InjectRepository(InstanciaFlujo) private insflujoRepo: Repository<InstanciaFlujo>,
    @InjectRepository(InstanciaTarea) private insTareaRepo: Repository<InstanciaTarea>,
    @InjectRepository(Transicion) private insTransRepo: Repository<Transicion>,
    private responseService: ResponseService) { }

  async create(createInstanciaFlujoDto: CreateInstanciaFlujoDto) {
    try {
      const resultado = await this.insflujoRepo.save(createInstanciaFlujoDto);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  findAll() {
    return `This action returns all instanciaFlujo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instanciaFlujo`;
  }

  update(id: number, updateInstanciaFlujoDto: UpdateInstanciaFlujoDto) {
    return `This action updates a #${id} instanciaFlujo`;
  }

  remove(id: number) {
    return `This action removes a #${id} instanciaFlujo`;
  }

  async date() {
    return (await this.insflujoRepo.query('select now()'))[0].now;
  }

  ////////////////////////////////////////////flujo////////
  // Método para iniciar un nuevo flujo
  async iniciarFlujo(createInstanciaFlujoDto: CreateInstanciaFlujoDto): Promise<any> {
    try {
      // Insertar la instancia del flujo
      console.log('createInstanciaFlujoDto', createInstanciaFlujoDto);
      const flujoQuery = await this.create(createInstanciaFlujoDto);
      const idInsFlujo = flujoQuery.data.id_ins_flujo;
      console.log('idInsFlujo', idInsFlujo);
      console.log('flujoQuery', flujoQuery);

      // Obtener la primera tarea del flujo
      const primeraTareaQuery = `
        SELECT id_tarea FROM public.tarea
        WHERE id_flujo = $1
        ORDER BY nro_tarea ASC
        LIMIT 1;`;

      const paramsTarea: any[] = [createInstanciaFlujoDto.id_flujo];
      const tareaResult = await this.insflujoRepo.query(primeraTareaQuery, paramsTarea);
      //obtener el id_tarea; 
      const idTarea = tareaResult[0].id_tarea;
      console.log(idTarea);

      // Insertar la primera tarea en la instancia
      const datoInsTarea = {
        "id_tarea": parseInt(idTarea),
        "id_ins_flujo": parseInt(idInsFlujo),
        "fecha_inicio": await this.date(),
        "fecha_fin": await this.date(),
        "finalizado": true,
        "observacion": 'INICIADO',
        "id_inst_tarea_anterior": 0,
        "usuario_registro": createInstanciaFlujoDto.usuario_registro
      };
      const resultado = await this.insTareaRepo.save(datoInsTarea);

      return this.responseService.success(resultado, "Listado Correctamente.")

      //return { resultado: 'OK', idInsFlujo };
    } catch (err) {
      throw new InternalServerErrorException('Error al iniciar flujo');
    } finally {

    }
  }

  // Método para avanzar a la siguiente tarea o manejar rechazos
  //  async avanzarTarea(idInsFlujo: number, idTareaActual: number, idUsuario: number, observacion: string, esRechazo: boolean, condicion: boolean): Promise<any> {
  async avanzarTarea(avanzarDto: AvanzarDto): Promise<any> {
    //const client = await this.pool.connect();
    try {
      // Cerrar la tarea actual
      const datoInsTareaActual = {
        "id_ins_flujo": avanzarDto.id_ins_flujo,
        "id_tarea": avanzarDto.id_tarea_actual,
        "obervacion": "AVANZAR",
        "fecha_inicio": await this.date(),
        "fecha_fin": await this.date(),
        "finalizado": true,
        "id_inst_tarea_anterior": 0,
        "usuario_registro": avanzarDto.usuario_registro
      };
      const cerrarTareaQuery = `
          UPDATE public.instancia_tarea
          SET finalizado = true, fecha_fin = NOW(), observacion = $1
          WHERE id_ins_flujo = $2 AND id_tarea = $3;  `;
      const params1: any[] = [avanzarDto.observacion, avanzarDto.id_ins_flujo, avanzarDto.id_tarea_actual];
      console.log('cerrarTareaQuery', cerrarTareaQuery);
      const transicionResult2 = await this.insTransRepo.query(cerrarTareaQuery, params1)
      console.log('transicionResult2', transicionResult2);

      /////////////////////////////CERRAR TAREA /////////////////////////////////
      // Obtener la siguiente tarea basada en si es un rechazo  y si tiene condiciones
      const transicionQuery = `
        SELECT id_tarea_destino FROM public.transicion
        WHERE id_tarea_origen = $1 AND es_rechazo = $2 AND condicion = $3;`;

      const params: any[] = [avanzarDto.id_tarea_actual, avanzarDto.es_rechazo, avanzarDto.condicion];
      const transicionResult = await this.insTransRepo.query(transicionQuery, params)
      console.log('transicionResult', transicionResult);

      const idTareaDestino = transicionResult[0].id_tarea_destino;

      const datoInsTareaNueva = {
        "id_tarea": parseInt(idTareaDestino),
        "id_ins_flujo": avanzarDto.id_ins_flujo,
        "fecha_inicio": await this.date(),
        "fecha_fin": await this.date(),
        "finalizado": false,
        "observacion": 'INICIADO',
        "id_inst_tarea_anterior": 0,
        "usuario_registro": avanzarDto.usuario_registro
      };
      console.log('NUEVA TAREA', datoInsTareaNueva);
      // Registrar la nueva tarea en la instancia
      try {
        const instanciaTareaQuery = await this.insTareaRepo.save(datoInsTareaNueva);
        console.log('instanciaTareaQuery', instanciaTareaQuery);

      } catch (err) {
        throw new InternalServerErrorException('Error al obtener el estado del flujo');
      } finally {
      }

      // Si la tarea destino es la última, marcar el flujo como finalizado
      const esTareaFinalQuery = `
            SELECT t.id_tipo_tarea FROM public.tarea t
            WHERE t.id_tarea = $1;`;

      const tareaFinalResult = await this.insTareaRepo.query(esTareaFinalQuery, [idTareaDestino]);
      if (tareaFinalResult.rows[0].id_tipo_tarea === 2) {
        const finalizarFlujoQuery = `
            UPDATE public.instancia_flujo
            SET finalizado = true, fecha_fin = NOW()
            WHERE id_ins_flujo = $1;
          `;
        await this.insTareaRepo.query(finalizarFlujoQuery);
      }

      return { resultado: 'OK' };
    } catch (err) {
      //     throw new InternalServerErrorException('Error al avanzar tarea');
    } finally {

    }
  }

  // Método para obtener el estado actual de un flujo
  /* async obtenerEstadoFlujo(idInsFlujo: number): Promise<any> {
     const client = await this.pool.connect();
     try {
       const estadoQuery = `
         SELECT t.descripcion_tarea, it.fecha_inicio, it.fecha_fin, it.finalizado
         FROM public.instancia_tarea it
         JOIN public.tarea t ON it.id_tarea = t.id_tarea
         WHERE it.id_ins_flujo = $1
         ORDER BY it.fecha_inicio ASC;
       `;
       const estadoResult = await client.query(estadoQuery, [idInsFlujo]);
       return estadoResult.rows;
     } catch (err) {
       //    throw new InternalServerErrorException('Error al obtener el estado del flujo');
     } finally {
       client.release();
     }
   }*/

}
