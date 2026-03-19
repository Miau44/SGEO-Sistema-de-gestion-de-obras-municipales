import { Contrato } from './../contrato-modificatorio/entities/contrato.entity';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>,
  ) {}

  // ============================
  // CREAR ARCHIVO ACTA
  // ============================
  async create(dto: CreateArchivoActaDto) {
    if (!dto.id_informe) {
      throw new BadRequestException('id_informe es obligatorio');
    }

    if (
      dto.id_tipo_recepcion !== undefined &&
      ![1, 2, 3].includes(dto.id_tipo_recepcion)
    ) {
      throw new BadRequestException(
        'id_tipo_recepcion solo puede ser 1 (Ingreso), 2 (Salida Supervisor) o 3 (Salida Empresa)',
      );
    }

    // 🔹 Validar informe
    const informe = await this.informeRepo.findOne({
      where: { id_informe: dto.id_informe },
    });

    if (!informe) {
      throw new NotFoundException('El informe no existe');
    }

    // 🔥 Obtener registro anterior (clave)
    const anterior = await this.archivoActaRepo.findOne({
      where: { id_informe: dto.id_informe },
      order: { fecha_registro: 'DESC' },
    });

    // 🔹 Crear nuevo registro
    const archivoActa = this.archivoActaRepo.create({
      ...dto,
      id_obra: informe.id_obra,
      id_estado: 1,
    });

    const saved = await this.archivoActaRepo.save(archivoActa);

    return {
      data: saved,
      anterior: anterior || null, // 🔥 importante para frontend
      message: 'Archivo Acta registrado correctamente',
    };
  }

  async getUltimoPorInforme(id_informe: number) {
  const ultimo = await this.archivoActaRepo.findOne({
    where: { id_informe },
    order: { fecha_registro: 'DESC' },
  });

    return ultimo || null;
  }

  // ============================
  // LISTAR ACTIVOS
  // ============================
  async findAll() {
    return this.archivoActaRepo.find({
      where: { id_estado: 1 },
      order: { fecha_registro: 'ASC' },
    });
  }

  // ============================
  // OBTENER ÚLTIMO POR INFORME
  // ============================
  async findOne(id_informe: number) {
    const row = await this.archivoActaRepo.findOne({
      where: { id_informe },
      order: { fecha_registro: 'DESC' }, // 🔥 clave
    });

    if (!row) {
      throw new NotFoundException('Registro no encontrado');
    }

    return row;
  }

  // ============================
  // ACTUALIZAR (MISMO REGISTRO)
  // ============================
  async guardar(
    id_archivo_acta: number,
    dto: UpdateArchivoActaDto,
  ) {
    const archivoActa = await this.archivoActaRepo.findOne({
      where: { id_archivo_acta },
    });

    if (!archivoActa) {
      throw new NotFoundException('Archivo Acta no encontrado');
    }

    const tipoRecepcion =
      dto.id_tipo_recepcion ?? archivoActa.id_tipo_recepcion;

    if (![1, 2, 3].includes(tipoRecepcion)) {
      throw new BadRequestException('id_tipo_recepcion inválido');
    }

    const idDocumentoFinal =
      dto.id_documento ?? archivoActa.id_documento;

    if (tipoRecepcion === 2 && !idDocumentoFinal) {
      throw new BadRequestException(
        'id_documento es obligatorio para salida',
      );
    }

    // 🔹 limpiar documento si no aplica
    if (tipoRecepcion === 1 || tipoRecepcion === 3) {
      archivoActa.id_documento = null;
    }

    // 🔹 actualizar campos
    Object.assign(archivoActa, dto);

    archivoActa.fecha_modificacion = new Date();

    const saved = await this.archivoActaRepo.save(archivoActa);

    return {
      data: saved,
      message: 'Archivo Acta actualizado correctamente',
    };
  }

  // ============================
  // DESTINO DE SALIDA
  // ============================
  async obtenerDestinoSalida(
    id_obra: number,
    tipo_recepcion: number,
  ) {
    const Contrato = await this.contratoRepo.findOne({
      where: { id_obra },
    });

    if (!Contrato) {
      throw new NotFoundException('Informe no encontrado');
    }

    const idObra = Contrato.id_obra;

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
        representante:
          contrato?.proponente_representante || 'No registrado',
      };
    }

    // SALIDA FISCAL
    if (tipo_recepcion === 2) {
      const fiscal = await this.archivoActaRepo.query(
        `
        SELECT supervisor
        FROM vista_supervisores_obra
        WHERE id_obra = $1
        `,
        [idObra],
      );

      return {
        tipo: 'SALIDA_FISCAL',
        fiscal: fiscal[0]?.supervisor || 'No registrado',
      };
    }
  }
}