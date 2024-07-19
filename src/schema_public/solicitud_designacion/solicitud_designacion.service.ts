import { Injectable } from '@nestjs/common';
import { CreateSolicitudDesignacionDto } from './dto/create-solicitud_designacion.dto';
import { UpdateSolicitudDesignacionDto } from './dto/update-solicitud_designacion.dto';
import { SolicitudDesignacion } from './entities/solicitud_designacion.entity';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
;

@Injectable()
export class SolicitudDesignacionService {

constructor(@InjectRepository(SolicitudDesignacion)
private solDesigRepositorio:Repository<SolicitudDesignacion>,
private responseService:ResponseService){}




  async create(createSolicitudDesignacionDto: CreateSolicitudDesignacionDto) {
    try {
      const resultado = await this.solDesigRepositorio.save(createSolicitudDesignacionDto);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all solicitudDesignacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudDesignacion`;
  }

  update(id: number, updateSolicitudDesignacionDto: UpdateSolicitudDesignacionDto) {
    return `This action updates a #${id} solicitudDesignacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudDesignacion`;
  }
}
