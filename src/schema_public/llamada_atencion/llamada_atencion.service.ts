import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLlamadaAtencionDto } from './dto/create-llamada_atencion.dto';
import { UpdateLlamadaAtencionDto } from './dto/update-llamada_atencion.dto';

import { ResponseService } from 'src/response.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { LlamadaAtencion } from './entities/llamada_atencion.entity';
import { Memorandum } from '../memorandum/entities/memorandum.entity';
import { CrearLlamadaAtencionFormDto } from './dto/crear-llamada-atencionForm.dto';
import { MemorandumService } from '../memorandum/memorandum.service';

@Injectable()
export class LlamadaAtencionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly responseService: ResponseService,
    private readonly correlativoService: CorrelativoService,
    private readonly memoService: MemorandumService,

    @InjectRepository(Memorandum)
    private readonly memoRepo: Repository<Memorandum>,

    @InjectRepository(LlamadaAtencion)
    private readonly llamadaRepo: Repository<LlamadaAtencion>,
  ) {}

  async crear(dto: CrearLlamadaAtencionFormDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ID_TIPO_MEMO = 374;
      const ID_TIPO_DOCUMENTO = 374;
      const ID_SUBTIPO_OTROS = 378;

      
      const esOtros = Number(dto.id_subtipo_llamada) === ID_SUBTIPO_OTROS;
      const referencia = (dto.referencia ?? '').trim();
      const descripcion = (dto.descripcion ?? '').trim();

      if (!referencia) throw new Error('Debe ingresar la referencia.');
      if (!descripcion) throw new Error('Debe ingresar la descripción.');
      if (esOtros) {}
      // 1) Crear correlativo
      const corrRes = await this.correlativoService.create({
        id_obra: dto.id_obra,
        id_tipo_documento: ID_TIPO_DOCUMENTO,
        correlativo: '',
        usuario_registro: dto.id_usuario,
        id_estado: 1,
      });

      if (!corrRes || corrRes.statusCode !== 200) {
        throw new Error('Error al generar correlativo del memorandum (llamada de atención).');
      }

      const id_correlativo = corrRes.data.id_correlativo;

      // 2) Crear memo con los valores que llegan del FRONT
      const memo = queryRunner.manager.create(Memorandum, {
        id_obra: dto.id_obra,
        id_tipo_memo: ID_TIPO_MEMO,
        id_correlativo,
        fecha_memo: new Date(),

        nombre_destinatario: '',
        nombre_remitente: '',
        cargo_remitente: '',

        // regla ya aplicada desde el front
        referencia,
        descripcion,

        id_usuario: dto.id_usuario,
        id_estado: 1,
      });

      const memoGuardado = await queryRunner.manager.save(Memorandum, memo);

      // 3) para añadir el encabezado
      const spRes = await queryRunner.manager.query(
        `SELECT * FROM public.sp_encabezado_documentos_memo($1, $2);`,
        [ID_TIPO_MEMO, dto.id_obra],
      );

      const row = spRes?.[0];

      if (row) {
        await queryRunner.manager.update(Memorandum, memoGuardado.id_memo, {
          de_nombre: row.de_nombre ?? [],
          cargo_remitente: row.de_cargo ?? '',
        });
      }

      // 4) llamada_atencion
      const llamada = queryRunner.manager.create(LlamadaAtencion, {
        id_obra: dto.id_obra,
        id_memo: memoGuardado.id_memo,
        id_subtipo_llamada: dto.id_subtipo_llamada,

        // opcional: solo guardar referencia_otro si es otros
        referencia_otro: esOtros ? (dto.referencia_otro ?? referencia) : null,

        fecha_instruccion: dto.fecha_instruccion ?? null,
        fecha_cumplimiento_instruccion: dto.fecha_cumplimiento_instruccion ?? null,
        libro_ordenes_obra: dto.libro_ordenes_obra ?? null,
        hoja_nro: dto.hoja_nro ?? null,
        fecha_maxima_cumplimiento_memo: dto.fecha_maxima_cumplimiento_memo ?? null,

        id_usuario: dto.id_usuario,
        id_estado: 1,
        id_estado_llamada_atencion: 1,
      } as any);

      const llamadaGuardada = await queryRunner.manager.save(LlamadaAtencion, llamada);

      await queryRunner.commitTransaction();
      return this.responseService.success(
        { memorandum: memoGuardado, llamada_atencion: llamadaGuardada },
        'Llamada de atención registrada correctamente.',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseService.error(error, 'Error al registrar la llamada de atención.');
    } finally {
      await queryRunner.release();
    }
  }


  async actualizar(dto: UpdateLlamadaAtencionDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const llamada = await qr.manager.findOne(LlamadaAtencion, {
        where: { id_llamada_atencion: dto.id_llamada_atencion, id_estado: 1 },
      });

      if (!llamada) throw new NotFoundException('No existe la llamada de atención');

      const ID_SUBTIPO_OTROS = 378;
   
      if (dto.id_subtipo_llamada !== undefined) llamada.id_subtipo_llamada = dto.id_subtipo_llamada;
      const subtipoFinal = dto.id_subtipo_llamada ?? llamada.id_subtipo_llamada;
      const esOtros = Number(subtipoFinal) === ID_SUBTIPO_OTROS;

      if (esOtros) {
        if (dto.referencia_otro !== undefined) llamada.referencia_otro = dto.referencia_otro ?? null;
      } else {
        llamada.referencia_otro = null; 
      }
      if (dto.fecha_instruccion !== undefined) llamada.fecha_instruccion = dto.fecha_instruccion ?? null;
      if (dto.fecha_cumplimiento_instruccion !== undefined) llamada.fecha_cumplimiento_instruccion = dto.fecha_cumplimiento_instruccion ?? null;
      if (dto.fecha_maxima_cumplimiento_memo !== undefined) llamada.fecha_maxima_cumplimiento_memo = dto.fecha_maxima_cumplimiento_memo ?? null;

      if (dto.libro_ordenes_obra !== undefined) llamada.libro_ordenes_obra = dto.libro_ordenes_obra ?? null;
      if (dto.hoja_nro !== undefined) llamada.hoja_nro = dto.hoja_nro ?? null;
      if (dto.id_estado_llamada_atencion !== undefined) llamada.id_estado_llamada_atencion = dto.id_estado_llamada_atencion;


      llamada.id_usuario = dto.id_usuario;

      await qr.manager.save(LlamadaAtencion, llamada);

      const tocaMemo = dto.referencia !== undefined || dto.descripcion !== undefined;

      if (tocaMemo) {
        const memo = await qr.manager.findOne(Memorandum, {where: { id_memo: llamada.id_memo, id_estado: 1 },});

        if (!memo) throw new NotFoundException('No se encontró el memorandum asociado');
        if (dto.referencia !== undefined) memo.referencia = dto.referencia.trim();
        if (dto.descripcion !== undefined) memo.descripcion = dto.descripcion.trim();

        memo.id_usuario = dto.id_usuario;
        await qr.manager.save(Memorandum, memo);
      }

      await qr.commitTransaction();

      return { statusCode: 200, message: 'Actualizado correctamente' };
    } catch (e) {
        await qr.rollbackTransaction();
        throw e;
    } finally {
        await qr.release();
    }
  }

  async obtenerPorId(id_llamada_atencion: number) {
    const data = await this.llamadaRepo
      .createQueryBuilder('la')
      .leftJoin('la.memo', 'm')
      .select([
        'la.id_llamada_atencion',
        'la.id_obra',
        'la.id_memo',
        'la.id_subtipo_llamada',
        'la.referencia_otro',
        'la.fecha_instruccion',
        'la.fecha_cumplimiento_instruccion',
        'la.fecha_maxima_cumplimiento_memo',
        'la.libro_ordenes_obra',
        'la.hoja_nro',
        'm.referencia',
        'm.descripcion',
      ])
      .where('la.id_llamada_atencion = :id', { id: id_llamada_atencion })
      .andWhere('la.id_estado = 1')
      .getRawOne();

    if (!data) throw new NotFoundException('No existe la llamada de atención');

    return { statusCode: 200, message: 'OK', data };
  }

  async listarPorObra(id_obra: number) {
    const rows = await this.llamadaRepo
      .createQueryBuilder('la')
      .leftJoin('la.memo', 'm')
      .select([
        'la.id_llamada_atencion',
        'la.id_obra',
        'la.id_memo',
        'la.id_subtipo_llamada',
        'la.referencia_otro',
        'la.fecha_instruccion',
        'la.fecha_cumplimiento_instruccion',
        'la.fecha_maxima_cumplimiento_memo',
        'la.libro_ordenes_obra',
        'la.hoja_nro',
        'la.fecha_registro',
        'la.id_estado_llamada_atencion',

        // text de estado
        `CASE la.id_estado_llamada_atencion
          WHEN 1 THEN 'Pendiente'
          WHEN 2 THEN 'Finalizado'
          ELSE 'Desconocido'
        END AS estado_desc`,

        // Memo info
        'm.referencia',
        'm.descripcion',
        'm.fecha_memo',
        'm.id_correlativo',
      ])
      .where('la.id_obra = :id_obra', { id_obra })
      .andWhere('la.id_estado = 1')
      .orderBy('la.id_llamada_atencion', 'DESC')
      .getRawMany();

    return { statusCode: 200, message: 'OK', data: rows };
  }


  create(createLlamadaAtencionDto: CreateLlamadaAtencionDto) {
    return 'This action adds a new llamadaAtencion';
  }

  findAll() {
    return `This action returns all llamadaAtencion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} llamadaAtencion`;
  }

  update(id: number, updateLlamadaAtencionDto: UpdateLlamadaAtencionDto) {
    return `This action updates a #${id} llamadaAtencion`;
  }

  remove(id: number) {
    return `This action removes a #${id} llamadaAtencion`;
  }



}
