import { Injectable } from '@nestjs/common';
import { CreateTransicionDto } from './dto/create-transicion.dto';
import { UpdateTransicionDto } from './dto/update-transicion.dto';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transicion } from './entities/transicion.entity';
import { NotFoundException } from '@nestjs/common';


@Injectable()
export class TransicionService {

  constructor(@InjectRepository(Transicion) private transicionRepo: Repository<Transicion>,
    private responseService: ResponseService) { }

  async create(createTransicionDto: CreateTransicionDto) {
    try {
      const resultado = await this.transicionRepo.save(createTransicionDto);

      return this.responseService.success(resultado, "Guardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async findAll() {
    try {

   const query = `   SELECT f.id_flujo, f.descripcion,  t.id_tarea, t.descripcion_tarea,  
      trs.id_transicion, trs.descripcion_transicion, trs.id_tarea_origen, trs.id_tarea_destino
       FROM tarea AS t 
      INNER JOIN flujo AS f ON t.id_flujo= f.id_flujo
      INNER JOIN transicion AS trs ON t.id_tarea = trs.id_tarea_origen
      INNER JOIN tarea as t2  ON  trs.id_tarea_destino = t2.id_tarea; `;

      //const resultado = await this.transicionRepo.find();  
      const resultado = await this.transicionRepo.query(query);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} transicion`;
  }

  async update(id_persona: number, updateTransicionDto: UpdateTransicionDto) {
    try {
      const resultado = await this.transicionRepo.update(id_persona, updateTransicionDto)
      return this.responseService.success(id_persona, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async eliminarTransicion(id: number): Promise<void> {
    const resultado = await this.transicionRepo.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Flujo con ID ${id} no encontrado`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} transicion`;
  }






  

}
