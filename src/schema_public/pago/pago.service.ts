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

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }

  async listaTipoPago(data: PagoObraDto) {
    try {
      let query = `               
        SELECT tmp.id_subtipo as tipo_pago, p.desc_subtipo, p.id_subtipo  FROM public.tipo_modificacion_pago AS tmp
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
        SELECT * FROM  public.vista_planilla_pago_lista   
      WHERE id_obra= $1  AND id_modificacion_pago = $2;`

      const params = [data.id_obra, data.id_modificacion_pago, ];
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



}
