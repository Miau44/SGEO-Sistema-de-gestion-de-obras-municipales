import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { CreateModificacionDto } from './dto/create-modificacion.dto';
import { ValidarModificacionDto } from './dto/dto-modificacion/validar-modificacion.dto';



@Injectable()
export class ModificacionPagoService {
  constructor(
    @InjectRepository(ModificacionPago) private modPagoRepositorio: Repository<ModificacionPago>,
    @InjectRepository(Correlativo) private correlativoRepositorio: Repository<Correlativo>,
    @InjectRepository(Solicitud) private solicitudRepocitorio: Repository<Solicitud>,
    @InjectRepository(Modificacion) private modificacionRepocitorio: Repository<Modificacion>,
    @InjectRepository(Pago) private pagoRepocitorio: Repository<Pago>,
    @InjectRepository(Planilla) private planillaRepocitorio: Repository<Planilla>,
    @InjectRepository(Modificacion) private readonly modificacionRepo: Repository<Modificacion>,

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

  async findOne(id_modificacion_pago: number) {
    
    try {
      const resultado = await this.modPagoRepositorio.findOneBy({ id_modificacion_pago });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
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
        id_estado_solicitud: 1,
        id_obra: dto.id_obra,
        id_estado_general: 21,
        id_usuario: dto.id_usuario,
        proveido: "SOLICITUD GENERADA POR SISTEMA-MODIFICACION",
        usuario_registro: dto.id_usuario,
        id_estado_registro: 1,
      };
      const respuesta_solicitud = await this.solicitudService.create(data_solicitud);

      const datosHistorial = {
        id_solicitud: respuesta_solicitud.data.id_solicitud,
        id_tipo_solicitud: respuesta_solicitud.data.id_tipo_solicitud,
        nro_solicitud: respuesta_solicitud.data.nro_solicitud,
        id_estado_solicitud: respuesta_solicitud.data.id_estado_solicitud,
        id_obra: respuesta_solicitud.data.id_obra,
        id_estado_general: respuesta_solicitud.data.id_estado_general,
        id_usuario: respuesta_solicitud.data.id_usuario,
        proveido: respuesta_solicitud.data.proveido,
        data_solicitud: respuesta_solicitud.data.data_solicitud,
        fecha_envio: respuesta_solicitud.data.fecha_envio,
        id_usuario_previo: respuesta_solicitud.data.id_usuario_previo,
        usuario_registro: respuesta_solicitud.data.usuario_registro,
        id_estado_registro: respuesta_solicitud.data.id_estado_registro,
      };

      const solicitud_historial = await this.solicitudService.createHistorial(datosHistorial)

      const data_correlativo_tipo = {
        "id_obra": dto.id_obra,
//        "id_tipo_documento": dto.tipo,
        "id_tipo_documento": 1,
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

      // if(dto.tipo ===3){dto.tipo =1}
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
      if (respuesta_modpago) {
        const dto_planilla = {
          id_obra: dto.id_obra,
          id_modificacion_pago: Number(respuesta_modpago.data.id_modificacion_pago),
          id_usuario_registro: dto.id_usuario
        }


        const respuesta_planilla = await this.servicioPlanilla.copiarItem(dto_planilla)
      }
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
      let query = `SELECT s.id_obra, vo.desc_cod_ue,  mp.id_modificacion_pago, s.id_solicitud,   
      tmp.id_correlativo_subtipo AS id_tipo_modificacion,      
          tmp.desc_subtipo AS tipo_modificacion,
           co.correlativo as nro_modificacion,
           cog.correlativo AS nro_correlativo,
           es.desc_estado as estado,
		   public.formato_numerico(m.monto_total,5) AS monto_total, 
 public.formato_numerico(m.monto_variacion,5) AS monto_variacion, 		 
            m.fecha_registro AS fecha_modificacion
           ,param.detalle AS porcentaje_permitido, sh.id_solicitud_historial	  
           FROM public.modificacion_pago AS mp
           INNER JOIN public.modificacion AS m ON mp.id_modificacion_pago = m.id_modificacion_pago
           INNER JOIN public.solicitud AS s ON mp.id_solicitud = s.id_solicitud 

LEFT JOIN (
    SELECT DISTINCT ON (id_solicitud) id_solicitud_historial, id_solicitud
    FROM public.solicitud_historial  
    ORDER BY id_solicitud, id_solicitud_historial DESC
) AS sh ON s.id_solicitud = sh.id_solicitud

--           LEFT JOIN ( SELECT id_solicitud_historial, id_solicitud FROM  public.solicitud_historial  ORDER BY id_solicitud_historial DESC LIMIT 1)          
--           AS sh ON s.id_solicitud = sh.id_solicitud    	  

           INNER JOIN public.estado_general AS eg ON s.id_estado_general = eg.id_estado_general 
           INNER JOIN public.estado_solicitud  AS es ON s.id_estado_solicitud = es.id_estado_solicitud 
         INNER JOIN public.tipo_modificacion_pago AS tmp ON mp.id_tipo_mod_pago = tmp.id_tipo_mod_pago
         INNER JOIN public.vista_datos_ficha_obra AS vo ON mp.id_obra = vo.id_obra
     LEFT JOIN  public.correlativo  AS co ON mp.id_correlativo_tipo = co.id_correlativo   
     LEFT JOIN  public.correlativo  AS cog ON mp.id_correlativo_subtipo = cog.id_correlativo
     LEFT JOIN (select * from parametrica where id_tipo =33) AS param ON param.id_subtipo = tmp.id_correlativo_subtipo
           WHERE mp.id_obra =$1  ORDER BY CAST(co.correlativo as INTEGER ) ASC`;
      const params: any[] = [data.id_obra];

      const resultado: any[] = await this.modPagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  //servicio para modificacion de dias_variacion marvel

  async updateDiasVariacion(id_modificacion: number, dias_variacion: number) {
    try {
      // Actualizar el campo directamente en la base de datos con QueryBuilder
      const resultado = await this.modificacionRepo
        .createQueryBuilder()
        .update('modificacion')
        .set({ dias_variacion })
        .where('id_modificacion = :id_modificacion', { id_modificacion })
        .execute();

      if (resultado.affected === 0) {
        return this.responseService.error('Registro no encontrado', '404');
      }

      return this.responseService.success({ id_modificacion, dias_variacion }, "Días de variación actualizado correctamente.");
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  
  async obtenerModificacion(id: number): Promise<Modificacion> {
    const modificacion = await this.modificacionRepo.findOne({ where: { id_modificacion: id } });
    if (!modificacion) {
      throw new NotFoundException(`Modificacion with ID ${id} not found`);
    }
    return modificacion;
  }


  async guardarModificacion(datos: CreateModificacionDto): Promise<Modificacion> {
    return await this.modificacionRepo.save(datos);
  }

  //  async validarModificacion(data: ValidarModificacionDto): Promise<{ valido: boolean; mensaje: string }> {
  async validarModificacion(data: ValidarModificacionDto) {
    // try {
    const params1 = [data.id_obra]
    let mensaje :any  = '';
    // 1️⃣ Validar que todos los registros en `item` sean `finalizado = true`
    const itemQuery = await this.modPagoRepositorio.query(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN finalizado = true THEN 1 ELSE 0 END) AS finalizados 
       FROM public.item WHERE id_obra = $1 AND id_estado = 1`, params1);
    if (Number(itemQuery[0].total) === 0 || Number(itemQuery[0].total) !== Number(itemQuery[0].finalizados)) {
      mensaje += 'Todos los Ítems deben deben estar finalizados antes de enviar al Fiscal.<br><br>';
    }

    // 3️⃣ Validar que todos los registros en `planilla` sean `finalizado = true`
    const params2 = [data.id_modificacion_pago]
    const planillaQuery = await this.modPagoRepositorio.query(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN finalizado = true THEN 1 ELSE 0 END) AS finalizados 
       FROM public.planilla WHERE id_modificacion_pago = $1 AND id_estado = 1`, params2);
    if (Number(planillaQuery[0].total) === 0 || Number(planillaQuery[0].total) !== Number(planillaQuery[0].finalizados)) {
      mensaje += 'Debe Finalizar la Planilla de Compútos Métricos antes de enviar al Fiscal.<br><br>';
    }
    console.log(' planillaQuery.rows[0].total', planillaQuery[0].total);


    // 2️⃣ Validar que exista al menos un registro en `informe`
    const informeQuery = await this.modPagoRepositorio.query(
      `SELECT COUNT(*) AS total FROM public.informe 
     WHERE id_obra = $1 AND id_tipo_informe = 266 AND id_estado = 1`, params1);

    if (Number(informeQuery[0].total) === 0) {
      mensaje += 'Debe completar el Informe antes de enviar al Fiscal.';
    }
    return {
      valido: mensaje === '',
      mensaje: mensaje || 'Validaciones correctas.',
    };

    // this.responseService.success(resultado, "Registrado Correctamente.")

    /*} catch (error) {
      console.error('Error al ejecutar validaciones:', error);
      return {
        valido: false,
        mensaje: 'Ocurrió un error al ejecutar las validaciones. Contacte al administrador.',
      };
    */

  }

  async aprobarModificacion(AprobarDto: ValidarModificacionDto) {
    try {

      // Validar los datos de entrada
      if (!AprobarDto.id_modificacion_pago) {
        throw new BadRequestException('Faltan datos necesarios para aprobar la modificacion.');
      }

      const query2 = `
      SELECT public.sp_aprobacion_x_tipo($1)	`;
      const params3 = [AprobarDto.id_modificacion_pago];
      const resultado = await this.modificacionRepo.query(query2, params3);

      // Guardar los cambios en la base de datos
      //const resultado = await this.guardarModificacion(modificacion);

      return this.responseService.success(resultado, "aprobada correctamente.");
    } catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }


  async tieneIncremento(idModificacionPago: number): Promise<boolean> {
    const result = await this.modificacionRepo.query(
      `SELECT sp_modificacion_tiene_incremento($1) AS resultado`,
      [idModificacionPago],
    );
    return result[0].resultado;
  }

  async listadoModificacionesxCarpeta(id_carpeta: number): Promise<boolean> {
    console.log('listadoModificacionesxCarpeta');
    console.log(id_carpeta);
    
    let q = `SELECT ficha.correlativo_carpeta, 
        (select id_contrato from contrato ct where ct.correlativo_carpeta = ficha.correlativo_carpeta limit 1) as id_contrato,
        id_modificacion,
        monto_total,
        porcentaje_total,
        monto_variacion,
        --porcentaje_variacion,
        fecha_fiscal,
        fecha_supervisor,
        fecha_memo_minuta, 
        dias_variacion, 
        1 as id_tipo_modificacion
        FROM modificacion
        JOIN modificacion_pago mp on modificacion.id_modificacion_pago = mp.id_modificacion_pago
        JOIN obra on mp.id_obra = obra.id_obra
        JOIN ficha on obra.id_ficha = ficha.id_ficha`;
    if(id_carpeta>0){
      q=q+` WHERE ficha.correlativo_carpeta = $1`
    }
    console.log(q);
    var res = await this.modificacionRepo.query(q,[id_carpeta]);
    console.log(res);
    return res;
  }
}