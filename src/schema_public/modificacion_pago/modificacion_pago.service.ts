import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ResponseService } from 'src/response.service';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modificacion } from './entities/modificacion.entity';
import { Pago } from './entities/pago.entity';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { ModificacionPago } from './entities/modificacion_pago.entity';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { SolicitudService } from '../solicitud/solicitud.service';
import { PlanillaService } from '../planilla/planilla.service';
import { Planilla } from '../planilla/entities/planilla.entity';
import { listaModDto } from './dto/obra.dto';



@Injectable()
export class ModificacionPagoService {
  constructor(
    @InjectRepository(ModificacionPago) private modPagoRepositorio: Repository<ModificacionPago>,
    @InjectRepository(Correlativo) private correlativoRepositorio: Repository<Correlativo>,
    @InjectRepository(Solicitud) private solicitudRepocitorio: Repository<Solicitud>,
    @InjectRepository(Modificacion) private modificacionRepocitorio: Repository<Modificacion>,
    @InjectRepository(Pago) private pagoRepocitorio: Repository<Pago>,
    @InjectRepository(Planilla) private planillaRepocitorio: Repository<Planilla>,

    private responseService: ResponseService,
    private solicitudService: SolicitudService,
    private servicioCorrelativo: CorrelativoService, 
    private servicioPlanilla: PlanillaService

  ) { }

  async create(createModificacionPagoDto: CreateModificacionPagoDto) {
    try {
      const resultado = await this.modPagoRepositorio.save(createModificacionPagoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error: any) {
      return this.responseService.error(error);
    }

  }
  findAll() {
    return `This action returns all modificacionPago`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modificacionPago`;
  }

  update(id: number, updateModificacionPagoDto: UpdateModificacionPagoDto) {
    return `This action updates a #${id} modificacionPago`;
  }

  remove(id: number) {
    return `This action removes a #${id} modificacionPago`;
  }


  async crearModificacionPago(dto: CreateMaestroDto) {
    try {
      const { tipo, subtipo, id_obra, id_usuario } = dto;
      let entidadGuardada: Modificacion | Pago;

      //crear Solicitud
      const data_solicitud = {
        id_tipo_solicitud: 0,
        id_estado_solicitud: 2,
        id_obra: dto.id_obra,
        id_estado_general: 21,
        id_usuario: 0,
        proveido: "SOLICITUD GENERADA POR SISTEMA-MODIFICACION",
        usuario_registro: dto.id_usuario,
        id_estado_registro: 1,
      };
      const respuesta_solicitud = await this.solicitudService.create(data_solicitud);
      const data_correlativo_tipo = {
        "id_obra": dto.id_obra,
        "id_tipo_documento": dto.tipo,
        "correlativo": "",
        "usuario_registro": dto.id_usuario,
        "id_estado": 1
      };
      const res_correlativo_tipo = await this.servicioCorrelativo.create(data_correlativo_tipo)

      //generar correlativo subtipo
      const data_correlativo = {
        "id_obra": dto.id_obra,
        "id_tipo_documento": dto.subtipo,
        "correlativo": "",
        "usuario_registro": dto.id_usuario,
        "id_estado": 1
      };
      const res_correlativo_subtipo = await this.servicioCorrelativo.create(data_correlativo)
      const data_modpago = {
        "id_obra": dto.id_obra,
        "id_solicitud": respuesta_solicitud.data.id_solicitud,
        "id_tipo_mod_pago": dto.tipo,
        "id_correlativo_tipo": Number(res_correlativo_tipo.data.id_correlativo),
        "id_correlativo_subtipo": Number(res_correlativo_subtipo.data.id_correlativo),
        "id_usuario_registro": dto.id_usuario,
        "id_estado": 1  
      };
      const respuesta_modpago = await this.create(data_modpago)
      if ([1, 2, 3].includes(tipo)) {
        const modificacion = {
          "id_modificacion_pago": Number(respuesta_modpago.data.id_modificacion_pago),
          "dias_variacion": 0,
          "monto_variacion": 0,
          "monto_total": 0,
          "porcentaje_modificacion": 0,
          "porcentaje_total": 0,
          "num_contrato_modificatorio": 0,
          "fecha_aprobacion_contrato": null,
          "fecha_supervisor": null,
          "fecha_fiscal": null,
          "fecha_memo_minuta": null,
          "id_usuario_registro": dto.id_usuario,
          "id_estado": 1
        }
        entidadGuardada = await this.modificacionRepocitorio.save(modificacion);

      } else if ([4, 5, 6, 7].includes(tipo)) {
        const pago = {
          "id_modificacion_pago": Number(respuesta_modpago.data.id_modificacion_pago),
          "monto_presente": 0,
          "deducciones": 0,
          "retenciones": 0,
          "multas": 0,
          "importe_por_pagar": 0,
          "monto_acumulado": 0,
          "porcentaje_ejecucion": 0,
          "fecha_aprobacion_pago": null,
          "fecha_aprobacion_contrato": null,
          "fecha_supervisor": null,
          "fecha_fiscal": null,
          "fecha_certificado": null,
          "id_usuario_registro": dto.id_usuario,
          "id_estado": 1
        }
        entidadGuardada = await this.pagoRepocitorio.save(pago);
      } else {
        throw new BadRequestException('Tipo no válido');
      }
     // return { entidad1: respuesta_modpago, relacionado: entidadGuardada };
if(respuesta_modpago){
      const dto_planilla ={id_obra:dto.id_obra,  
                          id_modificacion_pago:Number(respuesta_modpago.data.id_modificacion_pago), 
                          id_usuario_registro:dto.id_usuario }


      const respuesta_planilla = await this.servicioPlanilla.copiarItem(dto_planilla)}
     // return { entidad1: respuesta_modpago, relacionado: entidadGuardada};      

       return this.responseService.success({ entidad1: respuesta_modpago, relacionado: entidadGuardada},"Solicitud generada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }

  async listaModificacion(data: listaModDto) {
    try {
      ;
      let query = `SELECT s.id_obra,  mp.id_modificacion_pago, s.id_solicitud,   
 tmp.id_correlativo_subtipo AS id_tipo_modificacion,      
     desc_subtipo AS tipo_modificacion,
      co.correlativo as nro_modificacion,
      cog.correlativo AS nro_correlativo,
      es.desc_estado as estado, m.monto_total, monto_variacion, m.fecha_registro AS fecha_modificacion
      FROM public.modificacion_pago AS mp
      INNER JOIN public.modificacion AS m ON mp.id_modificacion_pago = m.id_modificacion_pago
      INNER JOIN public.solicitud AS s ON mp.id_solicitud = s.id_solicitud 
      INNER JOIN public.estado_general AS eg ON s.id_estado_general = eg.id_estado_general 
      INNER JOIN public.estado_solicitud  AS es ON s.id_estado_solicitud = es.id_estado_solicitud 
	  INNER JOIN public.tipo_modificacion_pago AS tmp ON mp.id_tipo_mod_pago = tmp.id_tipo_mod_pago
LEFT JOIN  public.correlativo  AS co ON mp.id_correlativo_tipo = co.id_correlativo   
LEFT JOIN  public.correlativo  AS cog ON mp.id_correlativo_subtipo = cog.id_correlativo       
      WHERE mp.id_obra =$1`;
      const params: any[] = [data.id_obra];

      const resultado: any[] = await this.modPagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }



}