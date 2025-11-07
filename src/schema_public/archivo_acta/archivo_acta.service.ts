import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivoActa } from './entities/archivo_acta.entity';

@Injectable()
export class ArchivoActaService {
  [x: string]: any;

  constructor(
      @InjectRepository(ArchivoActa) 
      private archivoActaRepositorio: Repository<ArchivoActa>
  ) { }

  async create(createArchivoActaDto: CreateArchivoActaDto) {
    try {
      console.log('CREAR SI', createArchivoActaDto);
      const resultado = this.archivoActaRepositorio.create(createArchivoActaDto);
      const resultado2 = await this.archivoActaRepositorio.save(resultado);
      const data = {
                      data:resultado2,
                      statusCode:200,
                      mess:"Registrado Correctamente"
                   };
      return data;
      //return this.responseService.success(resultado2, "Registrado Correctamente.")
    } catch (error) {
        console.log('CREAR NO', error);
        return this.responseService.error(error)
    }
    
  }

  findAll() {
    //return `This action returns all archivoActa`;
    return this.archivoActaRepositorio.find({ where: { id_estado: 1 }, order: { fecha_registro: 'ASC' } });
  }

  async findOne(id: number) {
    //return `This action returns a #${id} archivoActa`;
    const row = await this.archivoActaRepositorio.findOne({ where: { id_archivo_acta: id } });
    if (!row) throw new NotFoundException('Regitro no encontrado');
    return row;
  }

  update(id: number, updateArchivoActaDto: UpdateArchivoActaDto) {
    return `This action updates a #${id} archivoActa`;
  }

  update_ingreso(id: number, updateArchivoActaDto: UpdateArchivoActaDto) {
    return `This action updates a #${id} archivoActa`;
  }

  remove(id: number) {
    return `This action removes a #${id} archivoActa`;
  }

  async jenny(){
    let query = `select * from obra limit $1`;
    const params = [15];
    const resultado = await this.archivoActaRepositorio.query(query, params);
    return resultado;
  }
}
