import { Injectable } from '@nestjs/common';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { ResponseService } from 'src/response.service';
import { Repository } from 'typeorm';
import { ComputoObra } from './dto/computo-obra.dto';

@Injectable()
export class ComputoPlanillaService {

  constructor(
    @InjectRepository(Computo) private computoRepositorio: Repository<Computo>,
    private responseService: ResponseService

  ) { }


  async create(createComputoDto: CreateComputoDto) {
    try {
      const resultado = await this.computoRepositorio.save(createComputoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  findAll() {
    return `This action returns all computoPlanilla`;
  }

  findOne(id: number) {
    return `This action returns a #${id} computoPlanilla`;
  }

  update(id: number, updateComputoPlanillaDto: UpdateComputoDto) {
    return `This action updates a #${id} computoPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} computoPlanilla`;
  }


  async listaItemComputoXObra(data: ComputoObra) {
    try {
      ;
      let query = `SELECT * FROM public.item AS i
        INNER JOIN public.computo  AS c ON i.id_item = c.id_item 
        WHERE i.id_obra=$1`;
        const params: any[] = [data.id_obra];

      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


}
