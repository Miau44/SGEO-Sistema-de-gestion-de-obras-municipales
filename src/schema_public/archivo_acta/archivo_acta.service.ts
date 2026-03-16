import {Injectable, BadRequestException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivoActa } from './entities/archivo_acta.entity';
import { CreateArchivoActaDto } from './dto/create-archivo_acta.dto';
import { UpdateArchivoActaDto } from './dto/update-archivo_acta.dto';
import { Informe } from '../informe/entities/informe.entity';
import { Contrato } from '../contrato-modificatorio/entities/contrato.entity'; 

@Injectable()
export class ArchivoActaService {

  constructor(
    @InjectRepository(ArchivoActa)
    private readonly archivoActaRepo: Repository<ArchivoActa>,

    @InjectRepository(Informe)
    private readonly informeRepo: Repository<Informe>,
    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>,
  ) {}

  // CREAR ARCHIVO ACTA
  async create(dto: CreateArchivoActaDto) {

    //  Validación básica
    if (!dto.id_informe) {
      throw new BadRequestException('id_informe es obligatorio');
    }

    //  Validación tipo recepción (1 = ingreso, 2 = salida fiscal 3 = salida empresa)
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
      where: { id_informe: id },
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
  // Buscar registro existente
  const archivoActa = await this.archivoActaRepo.findOne({
    where: { id_archivo_acta },
  });

  if (!archivoActa) {
    throw new NotFoundException('Archivo Acta no encontrado');
  }

  //  Determinar tipo recepción final
  const tipoRecepcion =
    dto.id_tipo_recepcion ?? archivoActa.id_tipo_recepcion;

  if (![1, 2, 3].includes(tipoRecepcion)) {
    throw new BadRequestException('id_tipo_recepcion inválido');
  }

  //  Determinar id_documento final
  const idDocumentoFinal =
    dto.id_documento ?? archivoActa.id_documento;

  if (
    (tipoRecepcion === 2 ) &&
    dto.id_documento !== undefined &&
    !idDocumentoFinal
  ) {
    throw new BadRequestException(
      'id_documento inválido para salida',
    );
  }

  //  Si es ingreso, limpiamos id_documento
  if (tipoRecepcion === 1 || tipoRecepcion === 3) {
    archivoActa.id_documento = null;
  }

  //  Actualizar solo lo que llega
  Object.assign(archivoActa, dto);

  archivoActa.fecha_modificacion = new Date();

  // Guardar
  const saved = await this.archivoActaRepo.save(archivoActa);

  return {
    data: saved,
    message: 'Archivo Acta actualizado correctamente',
  };
}

async obtenerDestinoSalida(
  id_informe: number,
  tipo_recepcion: number
) {

  // 1️⃣ Buscar informe
  const informe = await this.informeRepo.findOne({
    where: { id_informe },
  });

  if (!informe) {
    throw new NotFoundException('Informe no encontrado');
  }

  const idObra = informe.id_obra;

  // INGRESO
  if (tipo_recepcion === 1) {
    return {
      tipo: 'INGRESO',
      texto: null,
    };
  }

  // SALIDA EMPRESA
  if (tipo_recepcion === 3) {
    const contrato = await this.contratoRepo.findOne({
      where: { id_obra: idObra },
    });

    return {
      tipo: 'SALIDA_EMPRESA',
      empresa: contrato?.proponente_razon_social || 'No registrado',
      representante: contrato?.proponente_representante || 'No registrado',
    };
  }

  // SALIDA FISCAL
  if (tipo_recepcion === 2) {

    const fiscal = await this.archivoActaRepo.query(
      `
      SELECT fiscal
      FROM vista_fiscales_obra
      WHERE id_obra = $1
      `,
      [idObra],
    );

    return {
      tipo: 'SALIDA_FISCAL',
      fiscal: fiscal[0]?.fiscal || 'No registrado',
    };
  }
}
}