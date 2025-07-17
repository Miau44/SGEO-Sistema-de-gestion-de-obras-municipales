import { Injectable } from '@nestjs/common';
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


@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago) private pagoRepositorio: Repository<Pago>,
   private responseService: ResponseService,
       @InjectRepository(Descuento) private descuentoRepocitorio: Repository<Descuento>,


    
    

  ) { }

  create(createPagoDto: CreatePagoDto) {
    return 'This action adds a new pago';
  }

  findAll() {
    return `This action returns all pago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
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
        mensaje += 'Debe completar el Informe antes de enviar al Fiscal.';
      }

      // 3️⃣ Validar que todos los registros que el monto total de pago no sea mayor al monto autorizado`
      const params4 = [data.id_obra, data.id_modificacion_pago, data.nro_pago]
      const diferenciaQuery = await this.pagoRepositorio.query(
        ` SELECT COUNT(*) AS total,  SUM(CASE WHEN diferencia_pago = false THEN 1 ELSE 0 END) AS diferencia_pago  
         FROM public.sp_certificado_planilla_pago($1, $2, $3)  `, params4);
      if (Number(diferenciaQuery[0].total) === 0 || Number(diferenciaQuery[0].total) !== Number(diferenciaQuery[0].diferencia_pago)) {
        mensaje += 'El Monto de Pago no debe sobrepasar el (Monto Autorizado). Verifique los ítems resaltados en rojo para corregirlos.<br><br>';
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
  







  
}
