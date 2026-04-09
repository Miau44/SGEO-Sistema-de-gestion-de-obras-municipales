import { Persona } from './../persona/entities/persona.entity';
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

    @InjectRepository(Contrato)
    private readonly persona: Repository<Persona>,
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
    ![1, 2, 3 ,4 , 5, 6, 7].includes(dto.id_tipo_recepcion)
  ) {
    throw new BadRequestException(
      'id_tipo_recepcion solo puede ser 1 (Ingreso), 2 (Salida Supervisor) o 3 (Salida Empresa) , 4 (legajo modificaciones) , 5 (legajo pagos)',
    );
  }

  // 🔥 VALIDACIONES NUEVAS (CLAVE)
  // INGRESO (tipo 1 y 5 )
  if (dto.id_tipo_recepcion === 1 || dto.id_tipo_recepcion === 5 ) {
    if (!dto.nombre_encargado || dto.nombre_encargado.trim() === '') {
      throw new BadRequestException('El campo "Ingresado por" es obligatorio');
    }
  }

  // SALIDA (tipo 2 y 3)
  if (dto.id_tipo_recepcion === 2 || dto.id_tipo_recepcion === 3) {
    if (!dto.nombre_responsable || dto.nombre_responsable.trim() === '') {
      throw new BadRequestException('El campo "Recepcionado por" es obligatorio');
    }
  }

  //LEGAJO MODIFICACIONES INGRESO (TIPO 4)
  if (dto.id_tipo_recepcion === 4 ){
    if (!dto.nombre_responsable || dto.nombre_responsable.trim() === ''){
      throw new BadRequestException('El campo "Recepcionado por " es obligatorio')
    }
  }

  //LEGAJO MODIFICACIONES SALIDA (TIPO 5 )
  if (dto.id_tipo_recepcion === 5){
    if (!dto.nombre_responsable || dto.nombre_responsable.trim ()=== ''){
      throw new BadRequestException('El campo "Recepcionado por " es obligatorio')
    }
  }
  //LEGAJO PAGOS INGRESO (TIPO 6 )
  if (dto.id_tipo_recepcion === 6){
    if (!dto.nombre_responsable || dto.nombre_responsable.trim ()=== ''){
      throw new BadRequestException('El campo "Recepcionado por " es obligatorio')
    }
  }
  //LEGAJO PAGOS SALIDA (TIPO 7 )
  if (dto.id_tipo_recepcion === 7){
    if (!dto.nombre_responsable || dto.nombre_responsable.trim ()=== ''){
      throw new BadRequestException('El campo "Recepcionado por " es obligatorio')
    }
  }
  // 🔹 Validar informe
  const informe = await this.informeRepo.findOne({
    where: { id_informe: dto.id_informe },
  });

  if (!informe) {
    throw new NotFoundException('El informe no existe');
  }

  // 🔥 EVITAR DUPLICADOS (MUY IMPORTANTE)
  const existente = await this.archivoActaRepo.findOne({
    where: {
      id_informe: dto.id_informe,
      id_tipo_recepcion: dto.id_tipo_recepcion,
    },
  });

  if (existente) {
    throw new BadRequestException(
      `Ya existe un registro para este tipo de recepción (${dto.id_tipo_recepcion})`,
    );
  }

  // 🔹 Crear nuevo registro
  const archivoActa = this.archivoActaRepo.create({
    ...dto,
    id_obra: informe.id_obra,
    id_estado: 1,
    fecha_registro: new Date(),   // siempre asignar fecha de registro
    fecha_modificacion: null, 
  });

  const saved = await this.archivoActaRepo.save(archivoActa);

  return {
    data: saved,
    message: 'Archivo Acta registrado correctamente',
  };
}

  async getUltimoPorInforme(id_informe: number, id_tipo_recepcion: number) {

  const ultimo = await this.archivoActaRepo.findOne({
    where: { id_informe, id_tipo_recepcion },
    order: { fecha_registro: 'DESC' },
  });

  if (!ultimo) return null;

  let documento = null;

  if (ultimo.id_documento) {
    const doc = await this.archivoActaRepo.query(`
      SELECT nombre_documento, ruta_documento
      FROM documento
      WHERE id_documento = $1
    `, [ultimo.id_documento]);

    documento = doc[0] || null;
  }

  return {
    ...ultimo,
    nombre_documento: documento?.nombre_documento || null,
    ruta_documento: documento?.ruta_documento || null,
  };
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

    if (![1, 2, 3, 4 ,5, 6, 7].includes(tipoRecepcion)) {
      throw new BadRequestException('id_tipo_recepcion inválido');
    }

    const idDocumentoFinal =
      dto.id_documento ?? archivoActa.id_documento;

    if (tipoRecepcion === 2 && !idDocumentoFinal || tipoRecepcion === 4 && !idDocumentoFinal || tipoRecepcion === 7 && !idDocumentoFinal) {
      throw new BadRequestException(
        'id_documento es obligatorio para salida',
      );
    }

    // 🔹 limpiar documento si no aplica
    if (tipoRecepcion === 1 || tipoRecepcion === 3 || tipoRecepcion === 6) {
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

    // SALIDA FISCAL LEGAJO MODIFICACIONES Y PAGOS
    if (tipo_recepcion === 2 ) {
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


   if (tipo_recepcion === 4 || tipo_recepcion === 5 || tipo_recepcion === 6 || tipo_recepcion === 7) {

  const fiscal = await this.archivoActaRepo.query(
    `
    SELECT fiscal
    FROM vista_fiscales_obra
    WHERE id_obra = $1
    `,
    [idObra],
  );

  const supervisor = await this.archivoActaRepo.query(
    `
    SELECT supervisor
    FROM vista_supervisores_obra
    WHERE id_obra = $1
    `,
    [idObra],
  );

  return {
    tipo: 'SALIDA_FISCAL_SUPERVISOR',
    fiscal: fiscal[0]?.fiscal || 'No registrado',
    supervisor: supervisor[0]?.supervisor || 'No registrado',
  };
}

    
  }
  async MostrarNombreusuario(id_usuario: number) {
  return await this.persona.find({
    where: { id_usuario: id_usuario }
  });
}
}