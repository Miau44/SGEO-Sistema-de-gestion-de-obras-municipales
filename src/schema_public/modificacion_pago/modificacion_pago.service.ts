import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateModificacionPagoDto } from './dto/create-modificacion_pago.dto';
import { UpdateModificacionPagoDto } from './dto/update-modificacion_pago.dto';
import { ResponseService } from 'src/response.service';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { Correlativo } from '../correlativo/entities/correlativo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modificacion } from './entities/modificacion.entity';
import { Pago } from '../pago/entities/pago.entity';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { ModificacionPago } from './entities/modificacion_pago.entity';
import { CreateMaestroDto } from './dto/create-maestro.dto';
import { SolicitudService } from '../solicitud/solicitud.service';
import { PlanillaService } from '../planilla/planilla.service';
import { Planilla } from '../planilla/entities/planilla.entity';
import { listaModDto } from './dto/obra.dto';
import { CreateModificacionDto } from './dto/create-modificacion.dto';
import { ValidarModificacionDto } from './dto/dto-modificacion/validar-modificacion.dto';
import { catchError } from 'rxjs';
import { InformeService } from '../informe/informe_inicial.service';
import { ActualizarModPagoDto } from './dto/modificacion-pago.dto';

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
    private servicioPlanilla: PlanillaService,
    private readonly correlativoService: CorrelativoService,

    
    

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
      console.log('tipo', tipo);
      console.log('obra', id_obra);
      if (tipo < 4) {
        const queryModifiacion = `
          SELECT id_tipo_mod_pago
          FROM public.modificacion_pago AS mp
          INNER JOIN public.modificacion AS m ON mp.id_modificacion_pago = m.id_modificacion_pago      
          WHERE id_obra = $1 AND id_tipo_mod_pago IN(1,2) AND (m.finalizado = false OR m.finalizado IS NULL  ) AND mp.id_estado = 1`;
        const params = [id_obra];
        const modificacionPendiente = await this.modPagoRepositorio.query(queryModifiacion, params);
        


        if (modificacionPendiente.length > 0) {
          return this.responseService.error(null, 'Ya existe una modificación en curso que debe ser aprobada antes de registrar una nueva. Por favor, verifique.');

        }
        else {
          this.crearModificacion(dto)
          return this.responseService.success(dto, "Solicitud generada correctamente.");

        }
      }
      else {

        const queryObra1 = `
          SELECT id_tipo_mod_pago
          FROM public.modificacion_pago WHERE id_obra = $1 AND id_tipo_mod_pago IN(4,6,7)
          AND id_tipo_mod_pago =$2
          AND id_estado = 1;`;
        const parametros = [id_obra, tipo];
        const resultado = await this.modPagoRepositorio.query(queryObra1, parametros);

        if (resultado.length > 0) {
          return this.responseService.error(null, 'Pago existente: El Pago que intenta guardar ya está registrado para la Obra. Por favor verifique.');
        }
        else {
          this.crearModificacion(dto);
          return this.responseService.success(dto, "Solicitud generada correctamente.");
        }

      }

    } catch (error: any) {
      console.error('Error al verificar modificación en curso:', error);
      const mensajeError = error?.message || error?.detail || 'Ocurrió un error desconocido.';
      return this.responseService.error(error)
    }
  }


  async crearModificacion(dto: CreateMaestroDto) {
    try {
      const { tipo, subtipo, id_obra, id_usuario } = dto;
      let entidadGuardada: Modificacion | Pago;

      const esMenorQueCuatro = tipo < 4;
      const estadogeneral = esMenorQueCuatro ? 21 : 29; //modificación o pago
      const numeracion = esMenorQueCuatro ? 1 : 2; //modificación o pago

      //crear Solicitud
      const data_solicitud = {
        id_tipo_solicitud: 0,
        id_estado_solicitud: 1,
        id_obra: dto.id_obra,
        id_estado_general: estadogeneral,
        id_usuario: dto.id_usuario,
        proveido: "SOLICITUD GENERADA POR SISTEMA-MODIFICACION",
        usuario_registro: dto.id_usuario,
        id_estado_registro: 1,
      };
      //const respuesta_solicitud = await this.solicitudService.create(data_solicitud);
      const respuesta_solicitud = await this.solicitudRepocitorio.save(data_solicitud);

      const datosHistorial = {
        id_solicitud: respuesta_solicitud.id_solicitud,
        id_tipo_solicitud: respuesta_solicitud.id_tipo_solicitud,
        nro_solicitud: respuesta_solicitud.nro_solicitud,
        id_estado_solicitud: 2,
        id_obra: respuesta_solicitud.id_obra,
        id_estado_general: respuesta_solicitud.id_estado_general,
        id_usuario: respuesta_solicitud.id_usuario,
        proveido: respuesta_solicitud.proveido,
        data_solicitud: respuesta_solicitud.data_solicitud,
        fecha_envio: respuesta_solicitud.fecha_envio,
        id_usuario_previo: respuesta_solicitud.id_usuario_previo,
        usuario_registro: respuesta_solicitud.usuario_registro,
        id_estado_registro: respuesta_solicitud.id_estado_registro,
      };

      /*const datosHistorial = {
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
      };*/


      const solicitud_historial = await this.solicitudService.createHistorial(datosHistorial)

      const data_correlativo_tipo = {
        "id_obra": dto.id_obra,
        //        "id_tipo_documento": dto.tipo,
        "id_tipo_documento": numeracion,
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
        "id_solicitud": respuesta_solicitud.id_solicitud,
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
          "deduccion": 0,
          "retencion": 0,
          "multa": 0,
          "importe_por_pagar": 0,
          "monto_acumulado": 0,
          "porcentaje_presente": 0,
          "porcentaje_acumulado": 0,
          "fecha_aprobacion_pago": null,
          "fecha_aprobacion_contrato": null,
          "fecha_supervisor": null,
          "fecha_fiscal": null,
          "fecha_certificado": null,
          "fecha_frp": null,
          "fecha_inicio_periodo": null,
          "fecha_fin_periodo": null,
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

        // return { entidad1: respuesta_modpago, relacionado: entidadGuardada};      
        return this.responseService.success({ entidad1: respuesta_modpago, relacionado: entidadGuardada }, "Solicitud generada correctamente.");
      }

    } catch (error: any) {
      console.error('Error al verificar modificación en curso:', error);
      const mensajeError = error?.message || error?.detail || 'Ocurrió un error desconocido.';
      return this.responseService.error(error)
    }
  }

  async listaModificacion(data: listaModDto) {
    try {
      ;
      let query = ` SELECT * FROM  public.vista_modificacion_lista
           WHERE id_obra =$1  `;
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
        return this.responseService.error(
          new Error(`Registro no encontrado, id: ${id_modificacion}`),
          'Registro no encontrado',
          404
        );
      }

      return this.responseService.success({ id_modificacion, dias_variacion }, "Días de variación actualizado correctamente.");
    } catch (error) {
      console.log('Error en updateDiasVariacion:', error);

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
    let mensaje: any = '';
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

    const params3 = [data.id_obra, data.id_solicitud]
    // 2️⃣ Validar que exista al menos un registro en `informe`
    const informeQuery = await this.modPagoRepositorio.query(
      `SELECT COUNT(*) AS total FROM public.informe 
     WHERE id_obra = $1 AND id_tipo_informe IN( 266,268) AND id_solicitud = $2 AND id_estado = 1`, params3);

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
      const MAPEO_TIPO_CORRELATIVO: Record<number, number> = {
        257: 269, // FIS OC
        256: 267  // FIS CM
      };
      if (resultado) {
        const tipoCorrelativo = MAPEO_TIPO_CORRELATIVO[AprobarDto.id_tipo_modificacion];
        if (!tipoCorrelativo) return;
        const queryVerifica = `
          SELECT id_informe, id_correlativo 
          FROM public.informe
          WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1
          LIMIT 1`;

        const paramsVerifica = [AprobarDto.id_obra, tipoCorrelativo, AprobarDto.id_solicitud
        ];
        const [informeExistente] = await this.modPagoRepositorio.query(queryVerifica, paramsVerifica);
        if (!informeExistente) {
          throw new NotFoundException('No se encontró el informe para actualizar');
        }

        if (informeExistente.id_correlativo) {
          throw new BadRequestException('Este informe ya tiene un correlativo asignado');
        }
        // Generar el nuevo correlativo
        const correlativoMemoRes = await this.correlativoService.create({
          id_obra: AprobarDto.id_obra,
          id_tipo_documento: tipoCorrelativo,
          correlativo: '',
          usuario_registro: AprobarDto.id_usuario,
          id_estado: 1
        });
        const idCorrelativoMemo = correlativoMemoRes?.data?.id_correlativo;
        if (!idCorrelativoMemo) {
          throw new InternalServerErrorException('No se pudo generar el correlativo');
        }
        const query4 = `
        UPDATE public.informe
        SET id_correlativo = $4, fecha_aprobacion = NOW(), usuario_registro = $5
        WHERE id_obra = $1 AND id_tipo_informe = $2 AND id_solicitud = $3 AND id_estado = 1`;
        const params4 = [
          AprobarDto.id_obra, tipoCorrelativo, AprobarDto.id_solicitud, idCorrelativoMemo, AprobarDto.id_usuario
        ];
        const resultadoinforme = await this.modPagoRepositorio.query(query4, params4);
        if (!resultadoinforme || resultadoinforme.rowCount === 0) {
          throw new NotFoundException('Error al actualizar el informe con el nuevo correlativo');
        }
      }
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

  async listadoModificacionesxContrato(id_contrato: number,id_tipo: number): Promise<boolean> {

    // Validar que el id_contrato sea un número positivo o cero y no nulo
    if (id_contrato === null || id_contrato === undefined || id_contrato < 0) {
      throw new BadRequestException('El id_contrato debe ser un número positivo.');
    }
    // Validar que el id_tipo sea un número positivo o cero y no nulo
    if (id_tipo === null || id_tipo === undefined || id_tipo < 0) {
      throw new BadRequestException('El id_tipo debe ser un número positivo.');
    }

    let q = `SELECT ficha.correlativo_carpeta, 
        id_modificacion,
        id_contrato_dlc,
        ROUND(monto_total,2) AS monto_adjudicado,
        porcentaje_total,
        ROUND(monto_variacion, 2) AS  monto_variacion,
        porcentaje_modificacion,
        TO_CHAR(fecha_fiscal, 'DD/MM/YYYY') as fecha_fiscal,
        TO_CHAR(fecha_supervisor, 'DD/MM/YYYY') as fecha_supervisor,
        TO_CHAR(fecha_memo_minuta, 'DD/MM/YYYY') as fecha_memo_minuta,
        dias_variacion as diasplazo_proceso, 
        mp.id_tipo_mod_pago as tipocontrato,
        2 as tipoplazo, --calendario a confirmar con jenny
        numero_contrato,
        numero_contrato_modificatorio
        FROM modificacion
        JOIN modificacion_pago mp on modificacion.id_modificacion_pago = mp.id_modificacion_pago
        JOIN obra on mp.id_obra = obra.id_obra
        JOIN ficha on obra.id_ficha = ficha.id_ficha
				JOIN contrato on contrato.id_obra = obra.id_obra
				where modificacion.numero_contrato_modificatorio is null AND modificacion.finalizado = true AND mp.id_tipo_mod_pago = ${id_tipo}`;
    var res: any;
    console.log(id_tipo,id_contrato);
    
    if (id_contrato > 0) {
      q = q + ` AND contrato.id_contrato_dlc = ${id_contrato}`;
      console.log(`q`, q);
      
      var res = await this.modificacionRepo.query(q, []);
    }
    else {
      res = await this.modificacionRepo.query(q);
    }
    console.log(res);
    
    if (!res || res.length === 0) {
      throw new NotFoundException('No se encontraron registros.');
    }
    return res;
  }

  async listadoModificacionesxCarpeta(id_carpeta: number): Promise<boolean> {

    // Validar que el id_contrato sea un número positivo o cero y no nulo
    if (id_carpeta === null || id_carpeta === undefined || id_carpeta < 0) {
      throw new BadRequestException('id_carpeta no encontrado.');
    }

    let q = `SELECT * FROM vista_modificacion_pago`;
    var res: any;
    if (id_carpeta > 0) {
      q = q + ` AND ficha.correlativo_carpeta = $1`;
      var res = await this.modificacionRepo.query(q, [id_carpeta]);
    }
    else {
      res = await this.modificacionRepo.query(q);
    }

    //mensaje en caso de no encontrar registros
    if (!res || res.length === 0) {
      throw new NotFoundException('No se encontraron registros con la carpeta especificada.');
    }
    return res;
  }

  async guardadoNumeracion(id_modificacion: number, numero_contrato_modificatorio: string, fecha_memo_minuta: string): Promise<any> {
    try {

      // Validar que el id_modificacion sea un número positivo y no nulo
      if (!id_modificacion || id_modificacion <= 0) {
        throw new BadRequestException('El id_modificacion debe ser un número positivo.');
      }
      // Validar que el numero_contrato_modificatorio no esté vacío
      if (!numero_contrato_modificatorio || numero_contrato_modificatorio.trim() === '') {
        throw new BadRequestException('El numero_contrato_modificatorio no puede estar vacío.');
      }

      const mod = await this.modificacionRepocitorio.findOne({
        where: { id_modificacion },
        relations: ['modificacionpago'],
      });

      if (!mod) {
        throw new NotFoundException('Modificación no encontrada');
      }

      if (mod.modificacionpago.id_tipo_mod_pago == 1) {
        mod.fecha_memo_minuta = new Date(fecha_memo_minuta);
      }

      mod.numero_contrato_modificatorio = numero_contrato_modificatorio;

      const modificacionActualizada = await this.modificacionRepocitorio.save(mod);
      return modificacionActualizada;
    }
    catch (error) {
      console.error("Error en aprobarDesignacion:", error);
      return this.responseService.error(error);
    }
  }


  async actualizarAutorizado(data: ActualizarModPagoDto) {
    try {
      let query = ` 
      SELECT * FROM  sp_modificacion_pago_autorizado($1);`  ;
      const params = [data.id_modificacion_pago];
      const resultado = await this.modPagoRepositorio.query(query, params);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }
  
}