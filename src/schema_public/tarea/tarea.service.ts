import { Injectable } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FlujoTareaDto } from './dto/flujo.dto';
import { TareaDatosDto } from './dto/tarea-datos.dto';

@Injectable()
export class TareaService {
  constructor(@InjectRepository(Tarea) private tareaRepo: Repository<Tarea>,
    private responseService: ResponseService) { }


  async create(createTareaDto: CreateTareaDto) {
    try {
      const resultado = await this.tareaRepo.save(createTareaDto);

      return this.responseService.success(resultado, "Guardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async findAll() {
    try {
      const query = ` SELECT f.id_flujo,  f.descripcion, t.nro_tarea, t.id_tarea, t.descripcion_tarea, t.id_tipo_tarea, sub.desc_subtipo AS tipo_tarea,  t.tiempo_cumplimiento  FROM tarea AS t 
INNER JOIN flujo AS f ON t.id_flujo= f.id_flujo
INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=12 ) sub ON t.id_tipo_tarea = sub.id_subtipo`;

      //  const resultado = await this.tareaRepo.find();
      const resultado = await this.tareaRepo.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  findOne(id: number) {
    return `This action returns a #${id} tarea`;
  }

  async update(id_persona: number, updateTareaDto: UpdateTareaDto) {
    try {
      const resultado = await this.tareaRepo.update(id_persona, updateTareaDto)
      return this.responseService.success(id_persona, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async eliminarTarea(id: number): Promise<void> {
    const resultado = await this.tareaRepo.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Flujo con ID ${id} no encontrado`);
    }
  }
  remove(id: number) {
    return `This action removes a #${id} tarea`;
  }


  async tareasxFlujo(data: FlujoTareaDto) {
    try {
      const query1 = `
      SELECT f.id_flujo,   t.id_tarea, t.descripcion_tarea  FROM tarea AS t 
  INNER JOIN flujo AS f ON t.id_flujo= f.id_flujo
  INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=12 ) sub ON t.id_tipo_tarea = sub.id_subtipo
  WHERE  t.id_flujo =$1; `;
      const params = [data.id_flujo];
      const resultado = await this.tareaRepo.query(query1, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async flujoSiguienteTarea(data: TareaDatosDto) {
    try {
      {
        let resultado = { resultado: '', valor: '' };
        // Cerrar la tarea actual
        const insFlujo = await this.tareaRepo.query(
          'SELECT * FROM "instancia_flujo" WHERE "id_ins_flujo" = $1',
          [data.idInstanciaFlujo],
        );

        if (insFlujo.length > 0) {
          const insTarea = await this.tareaRepo.query(
            `SELECT "id_inst_tarea", "id_tarea", "id_ins_flujo"
             FROM "instancia_tarea"
             WHERE "id_ins_flujo" = $1
             ORDER BY "id_ins_tarea" DESC
             LIMIT 1`,
            [data.idInstanciaFlujo],
          );

          if (insTarea.length > 0) {
            const tareaActual = insTarea[0];

            if (data.idTareaDestino > 0) {
              // Finalizar la tarea actual
              await this.tareaRepo.query(
                `UPDATE "instancia_tarea"
                 SET "finalizado" = true, "fecha_fin" = NOW(), "observacion" = $1
                 WHERE "id_ins_tarea" = $2`,
                [data.observacion, tareaActual.id_ins_tarea],
              );

              // Crear nueva tarea
              const nuevaTareaId = await this.tareaRepo.query(
                'SELECT nextval(\'"InstanciaTarea_id_seq"\') AS id', // Obtener el siguiente ID
              );

              await this.tareaRepo.query(
                `INSERT INTO "instancia_tarea" 
                 ("id_ins_tarea", "fecha_inicio", "finalizado", "idEstado", "id_ins_flujo", "usuario_registro", "idTarea", "observacion", "aceptado", "idInsTareaAnterior")
                 VALUES ($1, NOW(), false, 1, $2, $3, $4, '', false, $5)`,
                [
                  nuevaTareaId[0].id,
                  tareaActual.id_ins_flujo,
                  data.usuario_registro,
                  data.idTareaDestino,
                  tareaActual.id_ins_tarea,
                ],
              );

              // Actualizar flujo y verificar si es la tarea final
              const tarea = await this.tareaRepo.query(
                'SELECT "idTipoTarea" FROM "Tarea" WHERE "idTarea" = $1',
                [data.idTareaDestino],
              );

              if (tarea.length > 0 && tarea[0].idTipoTarea === 2) {
                // Si es la tarea final, marcar como finalizado
                await this.tareaRepo.query(
                  `UPDATE "instancia_tarea" 
                   SET "finalizado" = true, "fecha_fin" = NOW()
                   WHERE "id_ins_tarea" = $1`,
                  [nuevaTareaId[0].id],
                );

                await this.tareaRepo.query(
                  `UPDATE "instancia_flujo" 
                   SET "fecha_fin" = NOW(), "finalizado" = true, "observacion" = $1
                   WHERE "id_ins_flujo" = $2`,
                  [data.observacion, data.idInstanciaFlujo],
                );
              }

              resultado.resultado = 'OK';
              resultado.valor = `Responsable: ${data.usuario_registro}`;
            } else {
              resultado.resultado = 'ERROR';
              resultado.valor = 'No se puede enviar a la siguiente tarea. Tarea destino no especificada.';
            }
          } else {
            resultado.resultado = 'ERROR';
            resultado.valor = 'Tarea actual no encontrada.';
          }
        } else {
          resultado.resultado = 'ERROR';
          resultado.valor = 'Flujo actual no encontrado.';
        }
      }
    //   return resultado;

      return this.responseService.success("Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
