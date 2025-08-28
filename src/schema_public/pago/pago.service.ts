import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './entities/pago.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { PagoObraDto } from './dto/pago.obra.dto';
import { PagoPlanillaDto } from './dto/pago_planilla.dto';
import { CreateDescuentoDto } from './dto/dto-descuento/create-descuento.dto';
import { Descuento } from './entities/descuento.entity';
import { PagoDescuentoDto } from './dto/dto-descuento/pago-descuento.dto';
import { PagoPagoDto } from './dto/pago-pago.dto';
import { ActualizarEstadoDescuentoDto } from './dto/dto-descuento/actualizar-descuento.dto';
import { ValidarPagoDto } from './dto/pago-validar.dto';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { AprobarPagoDto } from './dto/pago-aprobar.dto';
import { PagoModificacionPagoDto } from './dto/pago-mod-pago.dto';
import { UsuarioPagoDto } from './dto/pago-usuario.dto';




@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago) private pagoRepositorio: Repository<Pago>,
    private responseService: ResponseService,
    private correlativoServive: CorrelativoService,
    @InjectRepository(Descuento) private descuentoRepocitorio: Repository<Descuento>,
    //@InjectRepository(Correlativo) private correlativoRepocitorio: Repository<Correlativo>,




  ) { }

  create(createPagoDto: CreatePagoDto) {
    return 'This action adds a new pago';
  }

  findAll() {
    return `This action returns all pago`;
  }

  async findOne(id_pago: number) {
    try {
      const resultado = await this.pagoRepositorio.findOneBy({ id_pago });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



  async update(id_pago: number, updatePagoDto: UpdatePagoDto) {
    try {
      const resultado = await this.pagoRepositorio.update(id_pago, updatePagoDto)
      return this.responseService.success(id_pago, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }

  async listaTipoPago(data: PagoObraDto) {
    try {
      let query = `               
        SELECT tmp.id_subtipo as tipo_pago, tmp.desc_subtipo, p.id_subtipo  FROM public.tipo_modificacion_pago AS tmp
        INNER JOIN public.parametrica AS p ON tmp.id_correlativo_subtipo = p.id_subtipo
        INNER JOIN public.obra AS o  ON tmp.id_correlativo_subtipo = o.id_tipo_pago
        WHERE tmp.id_tipo = 2 AND p.id_estado =1 AND tmp.id_estado =1 AND o.id_obra = $1 `;
      const params: any[] = [data.id_obra];
      const resultado: any[] = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async listaPago(data: PagoObraDto) {
    try {
      ;
      let query = ` SELECT * FROM  public.vista_pago_lista
           WHERE id_obra =$1  `;
      const params: any[] = [data.id_obra];

      const resultado: any[] = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async listaPlanillaPago(data: PagoPlanillaDto) {
    try {



      let query = ` 
      SELECT * FROM  sp_certificado_planilla_pago($1, $2, $3);`  ;
      const params = [data.id_obra, data.id_modificacion_pago, data.id_num_pago];
      const resultado = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }





  async createDescuento(data: CreateDescuentoDto) {
    try {

      const query = `SELECT public.sp_certificado_guardar_descuento($1, $2, $3, $4, $5, $6, $7) AS id_historial`;
      const params = [
        data.p_id_descuento,
        data.p_id_pago,
        data.p_id_tipo_descuento,
        data.p_monto,
        data.p_id_subtipo_descuento,
        data.p_detalle,
        data.p_id_usuario_registro
      ];

      const resultado = await this.pagoRepositorio.query(query, params);
      console.log('Resultado del SP:', resultado);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error: any) {
      return this.responseService.error(error);
    }

  }



  async listaDescuentoPago(data: PagoDescuentoDto) {
    try {

      let query = ` 
        SELECT * FROM  public.vista_pago_lista_descuento   
      WHERE id_pago= $1;`

      const params = [data.id_pago];
      const resultado = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }




  async listaResumenPago(data: PagoPlanillaDto) {
    try {

      let query = ` 
        SELECT * FROM  public.vista_pago_resumen   
      WHERE id_obra= $1  AND id_modificacion_pago = $2;`

      const params = [data.id_obra, data.id_modificacion_pago];
      const resultado = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async actualizarPagoTotales(data: PagoPagoDto) {
    try {
      let query = ` 
      SELECT * FROM  sp_certificado_actualizar_pago($1);`  ;
      const params = [data.id_pago];
      const resultado = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async actualizarEstadoDescuento(data: ActualizarEstadoDescuentoDto) {
    try {
      let query =
        ` UPDATE public.descuento 
          SET id_estado =0 WHERE id_descuento = $1 AND id_estado = 1`;
      const params: any[] = [data.id_descuento];
      const resultado: any[] = await this.pagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  //  async validarPago(data: ValidarPagoDto): Promise<{ valido: boolean; mensaje: string }> {
  async validarPago(data: ValidarPagoDto): Promise<{ valido: boolean; mensaje: string }> {
    try {
      const params1 = [data.id_obra]
      let mensaje: any = '';
      // 1️⃣ Validar que todos los registros en `item` sean `finalizado = true`
      const itemQuery = await this.pagoRepositorio.query(
        `SELECT COUNT(*) AS total, SUM(CASE WHEN finalizado = true THEN 1 ELSE 0 END) AS finalizados 
         FROM public.item WHERE id_obra = $1 AND id_estado = 1`, params1);
      if (Number(itemQuery[0].total) === 0 || Number(itemQuery[0].total) !== Number(itemQuery[0].finalizados)) {
        mensaje += 'Todos los Ítems deben deben estar finalizados antes de enviar al Fiscal.<br><br>';
      }

      /*   // 3️⃣ Validar que todos los registros en `planilla` sean `finalizado = true`
         const params2 = [data.id_modificacion_pago]
         const planillaQuery = await this.pagoRepositorio.query(
           `SELECT COUNT(*) AS total, SUM(CASE WHEN finalizado = true THEN 1 ELSE 0 END) AS finalizados 
            FROM public.planilla WHERE id_modificacion_pago = $1 AND id_estado = 1`, params2);
         if (Number(planillaQuery[0].total) === 0 || Number(planillaQuery[0].total) !== Number(planillaQuery[0].finalizados)) {
           mensaje += 'Debe Finalizar la Planilla de Compútos Métricos antes de enviar al Fiscal.<br><br>';
         }*/



      const params3 = [data.id_obra, data.id_solicitud]
      // 2️⃣ Validar que exista al menos un registro en `informe`
      const informeQuery = await this.pagoRepositorio.query(
        `SELECT COUNT(*) AS total FROM public.informe 
       WHERE id_obra = $1 AND id_tipo_informe IN( 356) AND id_solicitud = $2 AND id_estado = 1`, params3);

      if (Number(informeQuery[0].total) === 0) {
        mensaje += 'Debe completar el Informe antes de enviar al Fiscal.<br><br>';
      }

      // 3️⃣ Validar que todos los registros que el monto total de pago no sea mayor al monto autorizado`
      const params4 = [data.id_obra, data.id_modificacion_pago, data.nro_pago]
      const diferenciaQuery = await this.pagoRepositorio.query(
        ` SELECT COUNT(*) AS total,  SUM(CASE WHEN diferencia_pago = false THEN 1 ELSE 0 END) AS diferencia_pago  
         FROM public.sp_certificado_planilla_pago($1, $2, $3)  `, params4);
      if (Number(diferenciaQuery[0].total) === 0 || Number(diferenciaQuery[0].total) !== Number(diferenciaQuery[0].diferencia_pago)) {
        mensaje += 'El Monto de Pago no debe sobrepasar el (Monto Autorizado). Verifique los ítems resaltados en rojo para corregirlos.';
      }

      return {
        valido: mensaje === '',
        mensaje: mensaje || 'Validaciones correctas.',
      };


    } catch (error: any) {
      console.error('Error al ejecutar validaciones:', error);
      return {
        valido: false,
        mensaje: 'Ocurrió un error al ejecutar las validaciones. Contacte al administrador.',
      };
      // 

    }
  }



  async date() {
    return (await this.pagoRepositorio.query('select now()'))[0].now;
  }


  async preAprobarPago(AprobarDto: AprobarPagoDto) {
    try {
      // Validar los datos de entrada
      if (!AprobarDto.id_modificacion_pago) {
        throw new BadRequestException('Faltan datos necesarios para aprobar la modificacion.');
      }
      const tipoCorrelativo = AprobarDto.id_tipo; // Correlativo para Informe de Pago

      const queryVerifica = `
          SELECT id_informe, id_correlativo 
          FROM public.informe
          WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1
          LIMIT 1`;

      const paramsVerifica = [AprobarDto.id_obra, tipoCorrelativo, AprobarDto.id_solicitud
      ];

      const [informeExistente] = await this.pagoRepositorio.query(queryVerifica, paramsVerifica);
      console.log('informeExistente:', informeExistente);
      if (!informeExistente) {
        console.warn('No se encontró el informe para actualizar');
      }

      let tieneCorrelativo = false;
      if (informeExistente.id_correlativo) {
        console.warn('Este informe ya tiene un correlativo asignado');
        tieneCorrelativo = true;
      }

      if (!tieneCorrelativo) { }
      // Generar el nuevo correlativo
      const correlativoMemoRes = await this.correlativoServive.create({
        id_obra: AprobarDto.id_obra,
        id_tipo_documento: tipoCorrelativo,
        correlativo: '',
        usuario_registro: AprobarDto.id_usuario,
        id_estado: 1
      });
      const idCorrelativoMemo = correlativoMemoRes?.data?.id_correlativo;
      if (!idCorrelativoMemo) {
        console.warn('No se pudo generar el correlativo');
      }
      const query4 = `
        UPDATE public.informe
        SET id_correlativo = $4, fecha_aprobacion = NOW(), usuario_registro = $5
        WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1;`;
      const params4 = [
        AprobarDto.id_obra, tipoCorrelativo, AprobarDto.id_solicitud, idCorrelativoMemo, AprobarDto.id_usuario
      ];
      const resultadoinforme = await this.pagoRepositorio.query(query4, params4);
      if (!resultadoinforme || resultadoinforme.rowCount === 0) {
        console.warn('Error al actualizar el informe con el nuevo correlativo');
      }

      const query5 = `        
		 SELECT id_pago  FROM public.pago	WHERE id_modificacion_pago = $1;`
      const params5 = [AprobarDto.id_modificacion_pago]
      const [respuestaid_pago] = await this.pagoRepositorio.query(query5, params5);
      console.log('respuestaid_pago', respuestaid_pago);
      const pago = respuestaid_pago.id_pago;

      if (pago) {
        console.log('pagooo', pago);

        if (tipoCorrelativo === 356) {
          const datapago = { fecha_supervisor: await this.date() };
          await this.update(pago, datapago)
        }
        else {
          const query2 = `
        SELECT public.sp_certificado_aprobacion($1)	`;
          const params2 = [AprobarDto.id_modificacion_pago];
          const resultado = await this.pagoRepositorio.query(query2, params2);
        }
      }
      return this.responseService.success(resultadoinforme, "pre aprobada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }




  async AprobarPago(AprobarDto: PagoModificacionPagoDto) {
    try {
      // Validar los datos de entrada
      if (!AprobarDto.id_modificacion_pago) {
        throw new BadRequestException('Faltan datos necesarios para aprobar la modificacion.');
      }

      const query2 = `
      SELECT public.sp_certificado_aprobacion($1)	`;
      const params2 = [AprobarDto.id_modificacion_pago];
      const resultado = await this.pagoRepositorio.query(query2, params2);
      return this.responseService.success(resultado, "pre aprobada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }



  async maePago(AprobarDto: UsuarioPagoDto) {
    try {
      // Validar los datos de entrada
      if (!AprobarDto.id_usuario) {
        throw new BadRequestException('Faltan datos necesarios para aprobar la modificacion.');
      }

      const query2 = `
        SELECT  * FROM public.sp_certificado_mae($1);	`;

      const params2 = [AprobarDto.id_usuario];
      const resultado = await this.pagoRepositorio.query(query2, params2);
      return this.responseService.success(resultado, "pre aprobada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }



  async desAprobarPago(AprobarDto: AprobarPagoDto) {
    try {
      // Validar los datos de entrada
      const tipoCorrelativo = AprobarDto.id_tipo; // Correlativo para Informe de Pago
      const queryVerifica = `
          SELECT id_informe, id_correlativo 
          FROM public.informe
          WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1
          LIMIT 1;`;
      const paramsVerifica = [AprobarDto.id_obra, tipoCorrelativo, AprobarDto.id_solicitud
      ];

      const [informeExistente] = await this.pagoRepositorio.query(queryVerifica, paramsVerifica);
      console.log('informeExistente:', informeExistente);
      if (!informeExistente) {
        console.warn('No se encontró el informe para actualizar');
      }

      if (informeExistente.id_correlativo) {
        const query7 = ` UPDATE public.correlativo
        SET id_estado = 0
        WHERE id_correlativo =$1;`;
      const params7 = [informeExistente.id_correlativo];
      const resultadocorrelativo = await this.pagoRepositorio.query(query7, params7);
      }

      const query4 = `
        UPDATE public.informe
        SET id_correlativo = NULL, fecha_aprobacion = NULL
        WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1;`;
      const params4 = [AprobarDto.id_obra, AprobarDto.id_tipo, AprobarDto.id_solicitud];
      const resultadoinforme = await this.pagoRepositorio.query(query4, params4);
      if (!resultadoinforme || resultadoinforme.rowCount === 0) {
        console.warn('Error al actualizar el informe con el nuevo correlativo');
      }

      const query5 = `
        UPDATE public.pago
        SET fecha_aprobacion_pago = NULL
        WHERE id_modificacion_pago = $1  AND id_estado = 1;`;
      const params5 = [AprobarDto.id_modificacion_pago];

      const resultadopago = await this.pagoRepositorio.query(query5, params5);
      if (!resultadopago || resultadopago.rowCount === 0) {
        console.warn('Error al actualizar el informe con el nuevo correlativo');
      }


      return this.responseService.success(resultadopago, "pre aprobada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }


}
