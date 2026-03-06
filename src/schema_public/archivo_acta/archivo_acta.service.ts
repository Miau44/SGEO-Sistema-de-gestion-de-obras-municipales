import {Injectable, BadRequestException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivoActa } from './entities/archivo_acta.entity';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';
import { Informe } from '../informe/entities/informe.entity';

@Injectable()
export class ArchivoActaService {

  constructor(
    @InjectRepository(ArchivoActa)
    private readonly archivoActaRepo: Repository<ArchivoActa>,

    @InjectRepository(Informe)
    private readonly informeRepo: Repository<Informe>,
  ) {}

  // CREAR ARCHIVO ACTA
  async create(dto: CreateArchivoActaDto) {

    //  Validación básica
    if (!dto.id_informe) {
      throw new BadRequestException('id_informe es obligatorio');
    }

    //  Validación tipo recepción (1 = ingreso, 2 = salida)
    if (
    dto.id_tipo_recepcion !== undefined &&
    dto.id_tipo_recepcion !== 1 &&
    dto.id_tipo_recepcion !== 2 &&
    dto.id_tipo_recepcion !== 3
) {
  throw new BadRequestException(
    'id_tipo_recepcion solo puede ser 1 (Ingreso), 2 (Salida Supervisor) o 3 (Salida Empresa)',
  );
}

    //  Buscar informe
    const informe = await this.informeRepo.findOne({
      where: { id_informe: dto.id_informe },
    });

    if (!informe) {
      throw new NotFoundException('El informe no existe');
    }

    //  Crear archivo acta usando id_obra del informe
    const archivoActa = this.archivoActaRepo.create({
      ...dto,
      id_obra: informe.id_obra,
      id_estado: 1,
    });

    const saved = await this.archivoActaRepo.save(archivoActa);

    return {
      data: saved,
      message: 'Archivo Acta registrado correctamente',
    };
  }

  // LISTAR ACTIVOS
  async findAll() {
    return this.archivoActaRepo.find({
      where: { id_estado: 1 },
      order: { fecha_registro: 'ASC' },
    });
  }

  // OBTENER POR ID
  async findOne(id: number) {
    const row = await this.archivoActaRepo.findOne({
      where: { id_archivo_acta: id },
    });

    if (!row) {
      throw new NotFoundException('Registro no encontrado');
    }

    return row;
  }
// Servicio de guardar 
  async guardar(
  id_archivo_acta: number,
  dto: UpdateArchivoActaDto,
) {
  //  Buscar registro existente
  const archivoActa = await this.archivoActaRepo.findOne({
    where: { id_archivo_acta },
  });

  if (!archivoActa) {
    throw new NotFoundException('Archivo Acta no encontrado');
  }

  // Validar tipo recepción (si viene)
  const tipoRecepcion =
    dto.id_tipo_recepcion ?? archivoActa.id_tipo_recepcion;

  if (
    tipoRecepcion !== undefined &&
    tipoRecepcion !== 1 &&
    tipoRecepcion !== 2 &&
    tipoRecepcion !== 3
  ) {
    throw new BadRequestException(
      'id_tipo_recepcion inválido',
    );
  }

  //  Reglas por tipo (ejemplo)
  if (tipoRecepcion === 1 && !dto.fecha_entrega_dfo && !archivoActa.fecha_entrega_dfo) {
    throw new BadRequestException(
      'La fecha de ingreso es obligatoria',
    );
  }

  // Actualizar solo lo que llega
  Object.assign(archivoActa, dto);

  archivoActa.fecha_modificacion = new Date();

  //  Guardar cambios
  const saved = await this.archivoActaRepo.save(archivoActa);

  return {
    data: saved,
    message: 'Archivo Acta guardado correctamente',
  };
}
}