import { Injectable } from '@nestjs/common';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Computo } from './entities/computo.entity';
import { ResponseService } from 'src/response.service';
import { Repository } from 'typeorm';
import { ComputoObra } from './dto/computo-obra.dto';
import { Planilla } from './entities/planilla.entity';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { ComputoItem } from './dto/computo-Item.dto';
import { ComputoCriterio } from './entities/computo_criterio.entity';

@Injectable()
export class ComputoPlanillaService {

  constructor(
    @InjectRepository(Computo) private computoRepositorio: Repository<Computo>,
    @InjectRepository(Planilla) private planillaRepositorio: Repository<Planilla>,
    @InjectRepository(ComputoCriterio) private criterioRepositorio: Repository<ComputoCriterio>,    
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
      let query = `
      SELECT  s.id_solicitud,  i.id_item, c.id_computo, codigo_item, i.desc_item_sim, unidad_medida_sim, p_unitario_adjudicado, total_adjudicado, numero_veces,
      largo, ancho, alto, area, volumen, cantidad_planilla, monto_planilla, i.id_obra
      FROM public.item AS i
      LEFT OUTER JOIN public.computo  AS c ON i.id_item = c.id_item 
      LEFT OUTER JOIN public.planilla AS P ON i.id_item = c.id_item 
       INNER JOIN public.solicitud AS  s ON  i.id_obra = s.id_obra      
        WHERE i.id_obra=$1 AND s.id_solicitud = $2`;
        const params: any[] = [data.id_obra, data.id_solicitud];

      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaComputoXItem(data: ComputoItem) {
    try {
      ;
      let query = `
      SELECT  
      i.id_item, 
      c.id_computo, 
      codigo_item, i.desc_item_sim, unidad_medida_sim, p_unitario_adjudicado,
      total_adjudicado, 
      numero_veces,
      tramo, descripcion, 
      largo, ancho, alto, area, volumen, parcial, i.id_obra
      FROM public.item AS i
      LEFT OUTER JOIN public.computo  AS c ON i.id_item = c.id_item    
      WHERE i.id_item =$1`;
        const params: any[] = [data.id_item];

      const resultado: any[] = await this.computoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  


  ///////////////////////////////PLANILLA//////////////////////////////
  async createPlanilla(createComputoDto: CreatePlanillaDto) {
    try {
      const resultado = await this.planillaRepositorio.save(createComputoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }   


  ////////////////////////////////COMPUTO CRITERIO//////////////////

  async  findAllCriterio() {
    try {
      const resultado = await this.criterioRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }  
}
