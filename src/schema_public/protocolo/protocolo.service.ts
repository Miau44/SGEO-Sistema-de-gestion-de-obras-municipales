import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateProtocoloDto } from './dto/create-protocolo.dto';
import { UpdateProtocoloDto } from './dto/update-protocolo.dto';
import { CrearProtocoloModificacionDto } from './dto/create-protocolo-modificacion.dto';
import { FiltroFechasModificacionDto } from './dto/filtro_fechas_modificacion.dto';
import { FiltroDatosInformeDto } from './dto/filtro_datos_informe.dto';
import { Informe } from '../informe/entities/informe.entity';
import { Modificacion } from '../modificacion_pago/entities/modificacion.entity';
import { ModificacionPagoService } from '../modificacion_pago/modificacion_pago.service';

export interface FechasModificacionProtocoloResponse {
  id_modificacion: number;
  id_modificacion_pago: number;
  id_obra: number;
  dias_variacion: number | null;
  fecha_fiscal: Date | null;
  fecha_supervisor: Date | null;
  fecha_memo_minuta: Date | null;
}

export interface DatosInformeProtocoloResponse {
  id_informe: number;
  id_obra: number;
  referencia: string | null;
  antecedentes: string | null;
  analisis: string | null;
  obs_general: string | null;
  id_documento: any;
}


@Injectable()
export class ProtocoloService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly modificacionPagoService: ModificacionPagoService
  ) { }

  create(createProtocoloDto: CreateProtocoloDto) {
    return 'This action adds a new protocolo';
  }

  findAll() {
    return `This action returns all protocolo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} protocolo`;
  }

  update(id: number, updateProtocoloDto: UpdateProtocoloDto) {
    return `This action updates a #${id} protocolo`;
  }

  remove(id: number) {
    return `This action removes a #${id} protocolo`;
  }



  async crearProtocoloModificacion(dto: CrearProtocoloModificacionDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const {
        id_obra,
        id_modificacion,
        id_informe,
        id_usuario,
        justificacion,
        campos_modificacion,
        campos_informe,
      } = dto;

      // ============================
      // 0) Validar intentos máximos
      // ============================
      const intentosMaximos = 2;
      const intentosUsados = await this.contarIntentosProtocoloPorModificacionBD(
        id_modificacion,
      );

      if (intentosUsados >= intentosMaximos) {
        throw new Error(
          `Ya se alcanzó el número máximo de ediciones por protocolo (${intentosMaximos}) para esta modificación.`,
        );
      }

      // ==============================================
      // 1) Leer el registro actual de modificacion
      //    (para comparar dias_variacion original)
      // ==============================================
      const modificacionActual = await qr.manager.findOne(Modificacion, {
        where: { id_modificacion },
      });
      console.log("modificacionActual", modificacionActual);


      if (!modificacionActual) {
        throw new Error(
          `No se encontró la modificación con id_modificacion = ${id_modificacion}`,
        );
      }

      const diasVariacionOriginal = modificacionActual.dias_variacion ?? null; // valor que hoy está en BD

      let id_modificacion_historico: number | null = null;
      let id_informe_historico: number | null = null;

      //Abl, ajuste del orden en el proceso de ajustes
      if (campos_modificacion) {
        const fecha_fiscal = campos_modificacion.fecha_fiscal ?? null;
        const fecha_supervisor = campos_modificacion.fecha_supervisor ?? null;
        const fecha_memo_minuta = campos_modificacion.fecha_memo_minuta ?? null;
        const dias_variacion = campos_modificacion.dias_variacion ?? null;

        // ======================
        //  A) Actualizar la modificacion
        // ======================
        const resMod = await qr.query(
          `SELECT *
        FROM sp_protocolo_update_modificacion_lock(
          $1::int, -- p_id_modificacion
          $2::int, -- p_id_usuario
          $3::timestamp, -- p_fecha_fiscal
          $4::timestamp, -- p_fecha_supervisor
          $5::timestamp, -- p_fecha_memo_minuta
          $6::int        -- p_dias_variacion
        )
        `,
          [
            id_modificacion,
            id_usuario,
            fecha_fiscal,
            fecha_supervisor,
            fecha_memo_minuta,
            dias_variacion,
          ],
        );
        // console.log("resMod", resMod);
        // if (resMod && resMod.length > 0) {
        //   // === FLUJO DE ÉXITO ===
        //   console.log("resMod", resMod);

        //   id_modificacion_historico = resMod[0].id_modificacion_historico ?? null;
        //   console.log("id_modificacion_historico", id_modificacion_historico);

        //   // B) ACTUALIZAR DIAS VARIACION (Secuencialidad garantizada aquí dentro)
        //   const huboCambioDias =
        //     dias_variacion !== diasVariacionOriginal &&
        //     !(dias_variacion == null && diasVariacionOriginal == null);

        //   if (huboCambioDias) {
        //     console.log("cambio variación, id_modificacion:", id_modificacion);

        //     // Asegúrate de pasar el 'qr' para mantener la misma transacción
        //     await this.modificacionPagoService.actualizarDiazVariacion({
        //       id_modificacion,
        //     });

        //     console.log('[PROTOCOLO] Cambio en dias_variacion procesado.');
        //   }

        // } else {
        //   // === FLUJO DE ERROR ===
        //   throw new Error("No se pudo actualizar la modificación o el SP no devolvió datos.");
        // }
      }

      // ======================
      //  C ) PROCESAR INFORME
      // ======================
      if (campos_informe) {
        const referencia = campos_informe.referencia ?? null;
        const antecedentes = campos_informe.antecedentes ?? null;
        const analisis = campos_informe.analisis ?? null;
        const obs_general = campos_informe.obs_general ?? null;

        const resInf = await qr.query(
          `
        SELECT *
        FROM sp_protocolo_update_informe_lock(
          $1::int, -- p_id_informe
          $2::int, -- p_id_usuario
          $3::text, -- p_referencia
          $4::text, -- p_antecedentes
          $5::text, -- p_analisis
          $6::text  -- p_obs_general
        )
        `,
          [
            id_informe,
            id_usuario,
            referencia,
            antecedentes,
            analisis,
            obs_general,
          ],
        );

        id_informe_historico =
          resInf?.[0]?.id_informe_historico ?? null;
      }

      // ==========================================
      //   D) CREAR PROTOCOLO 
      // ==========================================
      const insertResult = await qr.manager
        .createQueryBuilder()
        .insert()
        .into('protocolo')
        .values({
          referencia_tabla_historico: 'modificacion',
          id_tabla_historico: id_modificacion_historico,
          id_obra,
          id_referencia_modulo: id_informe_historico,
          justificacion,
          id_usuario,
          id_estado: 1,
          fecha_registro: () => 'CURRENT_TIMESTAMP',
        })
        .returning('*')
        .execute();

      const protocolo = insertResult.raw?.[0];

      await qr.commitTransaction();

      return {
        message: 'Protocolo de modificación creado exitosamente',
        id_protocolo: protocolo?.id_protocolo,
        id_modificacion_historico,
        id_informe_historico,
      };
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }


  //datas para fechas de modificación
  async obtenerFechasModificacion(
    filtro: FiltroFechasModificacionDto,
  ): Promise<FechasModificacionProtocoloResponse[]> {
    const { id_obra, id_modificacion } = filtro;

    const result = await this.dataSource.query(
      'SELECT * FROM sp_protocolo_obtener_fechas_modificacion($1, $2)',
      [id_obra, id_modificacion ?? null],
    );

    return result as FechasModificacionProtocoloResponse[];
  }

  //datos para informe protocolo
  async obtenerDatosInforme(
    filtro: FiltroDatosInformeDto,
  ): Promise<DatosInformeProtocoloResponse[]> {
    const { id_obra, id_informe } = filtro;

    const result = await this.dataSource.query(
      'SELECT * FROM sp_protocolo_obtener_datos_informe($1, $2)',
      [id_obra, id_informe],
    );

    return result as DatosInformeProtocoloResponse[];
  }

  // contar intentos protocolo por modificacion
  async contarIntentosProtocoloPorModificacionBD(
    id_modificacion: number,
  ): Promise<number> {
    const result = await this.dataSource.query(
      'SELECT public.sp_protocolo_numero_intentos($1) AS total',
      [id_modificacion],
    );
    return result?.[0]?.total ?? 0;
  }







}
