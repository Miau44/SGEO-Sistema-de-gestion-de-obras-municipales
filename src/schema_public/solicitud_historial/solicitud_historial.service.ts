import { Injectable } from '@nestjs/common';
import { CreateSolicitudHistorialDto } from './dto/create-solicitud_historial.dto';
import { UpdateSolicitudHistorialDto } from './dto/update-solicitud_historial.dto';
import { SolicitudHistorial } from './entities/solicitud_historial.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { And, Any, Not, Repository } from 'typeorm';


@Injectable()
export class SolicitudHistorialService {

  constructor(@InjectRepository(SolicitudHistorial) private solicitudHRepositorio: Repository<SolicitudHistorial>,
  private responseService: ResponseService,
) { }

 async create(createSolicitudHistorialDto: CreateSolicitudHistorialDto) {
  try {
    const resultado = await this.solicitudHRepositorio.save(createSolicitudHistorialDto);
    return this.responseService.success(resultado, "Registrado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }  }

  findAll() {
    return `This action returns all solicitudHistorial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudHistorial`;
  }

 async update(id: number, updateSolicitudHistorialDto: UpdateSolicitudHistorialDto) {
    try {
      const resultado = await this.solicitudHRepositorio.update(id, updateSolicitudHistorialDto)
      return this.responseService.success(id, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} solicitudHistorial`;
  }
}
