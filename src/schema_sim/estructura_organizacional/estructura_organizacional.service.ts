import { Injectable } from '@nestjs/common';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { EstructuraOrganizacional } from './entities/estructura_organizacional.entity';
import { EstructuraDADto } from './dto/estructura-da.dto';


@Injectable()
export class EstructuraOrganizacionalService {

  constructor(
    @InjectRepository(EstructuraOrganizacional) private tipoDocRepositorio: Repository<EstructuraOrganizacional>,
    private responseService: ResponseService

  ) { }    
  create(createEstructuraOrganizacionalDto: CreateEstructuraOrganizacionalDto) {
    return 'This action adds a new estructuraOrganizacional';
  }

  async findAll(gestion:number) {
    try {
      const resultado = await this.tipoDocRepositorio.find({          
        where:{gestion: gestion}
      });
      return this.responseService.success(resultado, "Listado Correctamente.")
  
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} estructuraOrganizacional`;
  }

  update(id: number, updateEstructuraOrganizacionalDto: UpdateEstructuraOrganizacionalDto) {
    return `This action updates a #${id} estructuraOrganizacional`;
  }

  remove(id: number) {
    return `This action removes a #${id} estructuraOrganizacional`;
  }

  async estructuraDa(estructuraDa: EstructuraDADto) {
    try {

      const estructura = await this.findAll(estructuraDa.gestion)
      const nuevoArray: any = [];
      if (estructura) {
        const datosResumidos = estructura.data.filter((item: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => t.gestion === item.gestion && t.desc_cod_da === item.desc_cod_da);
        });
        if (datosResumidos) {
          for (var i = 0; i < datosResumidos.length; i++) {
            const nuevoElemento = {
              gestion: datosResumidos[i].gestion,
              cod_da: datosResumidos[i].cod_da,
              desc_cod_da: datosResumidos[i].desc_cod_da,
              nombre_da: datosResumidos[i].nombre_da,
              sigla_da: datosResumidos[i].sigla_da
            };
            nuevoArray.push(nuevoElemento);
          }
        }
      }
      const respuesta = nuevoArray
      return this.responseService.success(respuesta, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  
}
