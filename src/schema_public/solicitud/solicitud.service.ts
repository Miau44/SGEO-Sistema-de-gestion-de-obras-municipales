import { Injectable } from '@nestjs/common';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { Solicitud } from './entities/solicitud.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';




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
}
