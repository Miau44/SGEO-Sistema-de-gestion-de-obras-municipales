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

      // 0) Validación de negocio (otros motivos requiere texto)
      if (dto.id_subtipo_llamada === ID_SUBTIPO_OTROS) {
        const txt = (dto.referencia_otro ?? '').trim();
        if (!txt) throw new Error('Debe ingresar el detalle en "Referencia" para "Otros motivos".');
      }

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

      // 2) Preparar referencia/descripcion según regla
      const referencia = dto.desc_subtipo_llamada.trim();
      const descripcion =
        dto.id_subtipo_llamada === ID_SUBTIPO_OTROS
          ? (dto.referencia_otro ?? '').trim()
          : referencia;

      // 3) Crear Memorandum
      // OJO: en tu entity esos campos NO son nullable, así que aquí deben ir con algo.
      const memo = queryRunner.manager.create(Memorandum, {
        id_obra: dto.id_obra,
        id_tipo_memo: ID_TIPO_MEMO,
        id_correlativo,
        fecha_memo: new Date(),

        // si tu negocio los maneja, reemplaza '' por el valor real
        nombre_destinatario: '',
        nombre_remitente: '',
        cargo_remitente: '',

        referencia,
        descripcion,

        id_usuario: dto.id_usuario,
        id_estado: 1,
      });

      const memoGuardado = await queryRunner.manager.save(Memorandum, memo);

      // ✅ Encabezado: actualizar de_nombre y cargo_remitente del memo recién creado
      const datos = {
        id_tipo_memo: ID_TIPO_MEMO,     // 374
        id_obra: dto.id_obra,
        id_memo: memoGuardado.id_memo,
      };

      const encabezado = await this.memoService.crearencabezadoDocumentos(datos);
      if (!encabezado || encabezado.statusCode !== 200) {
        throw new Error('No se pudo crear/obtener el encabezado de documentos');
      }

      // Si tu método devuelve data[0] con de_nombre y de_cargo, actualizamos el memo:
      if (encabezado?.data?.length) {
        const datosencabezado = {
          de_nombre: encabezado.data[0].de_nombre || [],
          cargo_remitente: encabezado.data[0].de_cargo || '',
        };

        // ✅ dentro de la transacción
        await queryRunner.manager.update(Memorandum, memoGuardado.id_memo, datosencabezado);
      }

      // 4) Crear LlamadaAtencion
      const llamada = queryRunner.manager.create(LlamadaAtencion, {
        id_obra: dto.id_obra,
        id_memo: memoGuardado.id_memo,

        id_subtipo_llamada: dto.id_subtipo_llamada,
        referencia_otro: dto.referencia_otro ?? null,

        fecha_instruccion: dto.fecha_instruccion ?? null,
        fecha_cumplimiento_instruccion: dto.fecha_cumplimiento_instruccion ?? null,
        libro_ordenes_obra: dto.libro_ordenes_obra ?? null,
        hoja_nro: dto.hoja_nro ?? null,
        fecha_maxima_cumplimiento_memo: dto.fecha_maxima_cumplimiento_memo ?? null,

        id_usuario: dto.id_usuario,
        id_estado: 1,
        id_estado_llamada_atencion: 1,
      }as any); // casteo any para evitar error de tipos con los nullables

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

      // ---- PATCH llamada_atencion ----
      if (dto.id_subtipo_llamada !== undefined) llamada.id_subtipo_llamada = dto.id_subtipo_llamada;
      if (dto.referencia_otro !== undefined) llamada.referencia_otro = dto.referencia_otro ?? null;
      if (dto.fecha_instruccion !== undefined) llamada.fecha_instruccion = dto.fecha_instruccion ?? null;
      if (dto.fecha_cumplimiento_instruccion !== undefined) llamada.fecha_cumplimiento_instruccion = dto.fecha_cumplimiento_instruccion ?? null;
      if (dto.fecha_maxima_cumplimiento_memo !== undefined) llamada.fecha_maxima_cumplimiento_memo = dto.fecha_maxima_cumplimiento_memo ?? null;

      if (dto.libro_ordenes_obra !== undefined) llamada.libro_ordenes_obra = dto.libro_ordenes_obra ?? null;
      if (dto.hoja_nro !== undefined) llamada.hoja_nro = dto.hoja_nro ?? null;

      llamada.id_usuario = dto.id_usuario;

      await qr.manager.save(LlamadaAtencion, llamada);

      const tocaMemo = dto.desc_subtipo_llamada !== undefined || dto.referencia_otro !== undefined;

      if (tocaMemo) {
        const memo = await qr.manager.findOne(Memorandum, {
          where: { id_memo: llamada.id_memo, id_estado: 1 },
        });

        if (!memo) throw new NotFoundException('No se encontró el memorandum asociado');
        const desc = (dto.desc_subtipo_llamada ?? memo.referencia)?.trim(); // usa el nuevo si viene, sino el actual
        
        if (desc) memo.referencia = desc;
        const otro = dto.referencia_otro?.trim();
        memo.descripcion = otro ? otro : (desc ?? memo.descripcion);
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

        // Memo (solo lo útil para grilla)
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
