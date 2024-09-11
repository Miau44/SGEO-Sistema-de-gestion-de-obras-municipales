import { Injectable } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FlujoTareaDto } from './dto/flujo.dto';

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
}
