import { Injectable } from '@nestjs/common';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';
import { BandejaDto } from './dto/bandeja.dtos';




@Injectable()
export class SolicitudService {


  constructor(@InjectRepository(Solicitud) private solicitudRepositorio: Repository<Solicitud>,
  private responseService: ResponseService,
) { }

async  create(createSolicitudDto: CreateSolicitudDto) {
    try {
      const resultado = await this.solicitudRepositorio.save(createSolicitudDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all solicitud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitud`;
  }

 async update(id: number, updateSolicitudDto: UpdateSolicitudDto) {
    try {
      const resultado = await this.solicitudRepositorio.update(id, updateSolicitudDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} solicitud`;
  }




  async listarMiBandeja(bandeja: BandejaDto) {
    try {
      const query = `SELECT  o.id_obra, f.id_ficha,   f.cod_carpeta,  f.desc_cod_ue, f.desc_carpeta, 
      eo.gestion, eg.desc_estado_gral AS actividad,  
     s.fecha_registro as fecha, eg.url_formulario
     FROM obra AS o   
     INNER JOIN ficha f  ON o.id_ficha = f.id_ficha
     INNER JOIN (SELECT desc_cod_da, desc_cod_ue, nombre_ue,  gestion from estructura_organizacional
     WHERE  gestion =$1 GROUP BY desc_cod_da, desc_cod_ue,nombre_ue, gestion)  eo ON f.desc_cod_ue= eo.desc_cod_ue
     INNER JOIN solicitud AS s ON o.id_obra = s.id_obra
     INNER JOIN estado_solicitud  AS es ON  s.id_estado_solicitud = es.id_estado_solicitud
     INNER JOIN estado_general AS eg ON s.id_estado_general = eg.id_estado_general
     INNER JOIN  persona AS p ON p.id_usuario = s.id_usuario
     WHERE s.id_usuario =$2 AND s.id_estado_solicitud  =$3 AND p.id_estado IN(1,5) `;
      const values = [bandeja.gestion, bandeja.usuario, bandeja.estado]
      const resultado = await this.solicitudRepositorio.query(query, values);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }  

}
