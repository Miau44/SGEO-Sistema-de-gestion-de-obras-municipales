import { Injectable } from '@nestjs/common';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension } from './entities/suspension.entity';
import { IsNull, Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { MemorandumService } from '../memorandum/memorandum.service';
import { Memorandum } from '../memorandum/entities/memorandum.entity';
import { SuspensionObraDto } from './suspension-obra.dto';
import { Reinicio } from './entities/reinicio.entity';
import { CreateReinicioDto } from './dto/dto-reinicio/create-reinicio.dto';
import { UpdateReinicioDto } from './dto/dto-reinicio/update-reinicio.dto';
import { CorreoService } from '../correo/correo.service';


@Injectable()
export class SuspensionService {

  constructor(
    @InjectRepository(Suspension) private suspensionRepositorio: Repository<Suspension>,
    @InjectRepository(Reinicio) private reinicioRepositorio: Repository<Reinicio>,    

    private responseService: ResponseService,
    private correlativoService: CorrelativoService,
    private memoService: MemorandumService,
    private correoService: CorreoService,
  ) { }


  // async create(createSuspensionDto: CreateSuspensionDto) {
  //   try {
  //     const correlativoMemoRes = await this.correlativoService.create({
  //       id_obra: createSuspensionDto.id_obra,
  //       id_tipo_documento: 243,
  //       correlativo: '',
  //       usuario_registro: createSuspensionDto.id_usuario,
  //       id_estado: 1
  //     });
  //     const idCorrelativoMemo = correlativoMemoRes.data.id_correlativo;
  //     if (correlativoMemoRes.statusCode !== 200) {
  //       throw new Error('Error al generar correlativo del memorandum');
  //     }

  //     const data_memo = {
  //       "id_obra": createSuspensionDto.id_obra,
  //       // "id_tipo_memo": createSuspensionDto.id_tipo_suspension,
  //       "id_tipo_memo": 243,
  //       "id_correlativo": idCorrelativoMemo,
  //       "fecha_memo": new Date(),
  //       "nombre_destinatario": "",
  //       "referencia": "",
  //       "descripcion": "",
  //       "nombre_remitente": "",
  //       "cargo_remitente": "",
  //       "id_estado": 1,
  //       "id_usuario": createSuspensionDto.id_usuario,
  //     };
  //     const resultado_memo = await this.memoService.create(data_memo);
  //     createSuspensionDto.id_memo = resultado_memo.data.id_memo;

  //     const resultado = await this.suspensionRepositorio.save(createSuspensionDto);
  //     if(createSuspensionDto.id_tipo_suspension === 380){
  //     const respuestafalse = await this.buscarSuspensiones(createSuspensionDto.id_obra, false); 
  //   const data_update = {"id_padre_suspension" : respuestafalse.data.id_suspension}   
  //     this.update(respuestafalse.data.id_suspension, data_update )
      
  //     respuestafalse.data.id_suspension 
  //       resultado.id_suspension 
  //     }

  //       if (!resultado) {
  //       throw new Error('No se pudo la suspension');
  //     }
  
  //     const datos = {
  //       id_tipo_memo: createSuspensionDto.id_tipo_suspension,
  //       id_obra: createSuspensionDto.id_obra,
  //       id_memo: resultado_memo.data.id_memo,
  //     }

  //     const encabezado = await this.memoService.crearencabezadoDocumentos(datos)
  //     if (!encabezado) {
  //       throw new Error('No se pudo crear el encabezado de documentos');
  //     }
  //     return this.responseService.success(resultado, "Registrado Correctamente.")
  //   } catch (error) {
  //     return this.responseService.error(error);
  //   }
  // }

  async create(createSuspensionDto: CreateSuspensionDto) {
  try {
    // ✅ 0) VALIDACIÓN ESTRICTA: bloquear otra TOTAL si ya hay una TOTAL vigente
    if (createSuspensionDto.id_tipo_suspension === 380) {
      const bloqueoQuery = `
    SELECT 1
    FROM suspension s
    LEFT JOIN reinicio r
      ON r.id_suspension = s.id_suspension
     AND r.id_estado = 1
    WHERE s.id_obra = $1
      AND s.id_estado = 1
      AND s.id_tipo_suspension = 380
      AND (
        s.finalizado = false
        OR (
          s.finalizado = true
          AND (r.id_reinicio IS NULL OR r.finalizado <> true)
        )
      )
    LIMIT 1;
  `;

      const existe = await this.suspensionRepositorio.query(bloqueoQuery, [
        createSuspensionDto.id_obra,
      ]);

      if (existe.length > 0) {
        return this.responseService.error({
          message:
            'No puede crear otra Suspensión TOTAL: existe una TOTAL vigente (no finalizada o con reinicio pendiente).',
        });
      }
    }

    // 1) Crear correlativo para memo (tipo doc 243)
    const correlativoMemoRes = await this.correlativoService.create({
      id_obra: createSuspensionDto.id_obra,
      id_tipo_documento: 243,
      correlativo: '',
      usuario_registro: createSuspensionDto.id_usuario,
      id_estado: 1,
    });

    if (correlativoMemoRes.statusCode !== 200) {
      throw new Error('Error al generar correlativo del memorandum');
    }

    const idCorrelativoMemo = correlativoMemoRes.data.id_correlativo;

    // 2) Crear memo (tipo memo fijo 243)
    const data_memo = {
      id_obra: createSuspensionDto.id_obra,
      id_tipo_memo: 243,
      id_correlativo: idCorrelativoMemo,
      fecha_memo: new Date(),
      nombre_destinatario: '',
      referencia: '',
      descripcion: '',
      nombre_remitente: '',
      cargo_remitente: '',
      id_estado: 1,
      id_usuario: createSuspensionDto.id_usuario,
    };

    const resultado_memo = await this.memoService.create(data_memo);
    createSuspensionDto.id_memo = resultado_memo.data.id_memo;

    // 3) Guardar suspensión
    const resultado = await this.suspensionRepositorio.save(createSuspensionDto);

    if (!resultado) {
      throw new Error('No se pudo crear la suspensión');
    }

    // // 4) ABSORCIÓN: si es TOTAL (380)
    // if (createSuspensionDto.id_tipo_suspension === 380) {
    //   await this.suspensionRepositorio.update(
    //     {
    //       id_obra: createSuspensionDto.id_obra,
    //       id_tipo_suspension: 379,
    //       finalizado: true,
    //       id_estado: 1,
    //       id_padre_suspension: IsNull(),
    //     },
    //     { id_padre_suspension: resultado.id_suspension }
    //   );
    // }

    // 4) ABSORCIÓN: si es TOTAL (380)
    if (createSuspensionDto.id_tipo_suspension === 380) {
      const query = `
    UPDATE suspension s
    SET id_padre_suspension = $1
    WHERE s.id_obra = $2
      AND s.id_tipo_suspension = 379
      AND s.finalizado = true
      AND s.id_estado = 1
      AND s.id_padre_suspension IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM reinicio r
        WHERE r.id_suspension = s.id_suspension
          AND r.id_estado = 1
      );
  `;

      await this.suspensionRepositorio.query(query, [
        resultado.id_suspension,       // id_total
        createSuspensionDto.id_obra,   // id_obra
      ]);
    }


    // 5) Crear encabezado de documentos
    const datos = {
      id_tipo_memo: createSuspensionDto.id_tipo_suspension,
      id_obra: createSuspensionDto.id_obra,
      id_memo: resultado_memo.data.id_memo,
    };

    const encabezado = await this.memoService.crearencabezadoDocumentos(datos);
    if (!encabezado) {
      throw new Error('No se pudo crear el encabezado de documentos');
    }

    return this.responseService.success(resultado, 'Registrado Correctamente.');
  } catch (error) {
    return this.responseService.error(error);
  }
}

  async findAll() {
    try {
      const resultado = await this.suspensionRepositorio.find()
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

async buscarSuspensiones(id_obra: number, finalizado: boolean) {
  try {
    const resultado = await this.suspensionRepositorio.find({
      where: {
        id_obra,
        finalizado,
      },
    });

    return this.responseService.success(
      resultado,
      'Listado filtrado correctamente.'
    );
  } catch (error) {
    return this.responseService.error(error);
  }
}








    async findOne(id_suspension: number) {
    try {
      const resultado = await this.suspensionRepositorio.findOneBy({ id_suspension });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  // async update(id_suspension: number, updateSuspensionDto: UpdateSuspensionDto) {
  //   try {
  //     const resultado = await this.suspensionRepositorio.update(id_suspension, updateSuspensionDto)
  //     return this.responseService.success(id_suspension, "Actualizado Correctamente.")
  //   } catch (error) {
  //     return this.responseService.error(error);
  //   }        
  // }x

  async update(id_suspension: number, updateSuspensionDto: UpdateSuspensionDto) {
    try {
      const suspensionActual = await this.suspensionRepositorio.findOneBy({
        id_suspension,
      });

      if (!suspensionActual) {
        throw new Error('No se encontró la suspensión.');
      }

      const resultado = await this.suspensionRepositorio.update(
        id_suspension,
        updateSuspensionDto,
      );

      const seEstaFinalizando =
        suspensionActual.finalizado === false &&
        updateSuspensionDto.finalizado === true;

      if (seEstaFinalizando) {
        await this.enviarCorreoFinalizacionSuspension(
          updateSuspensionDto.id_obra || suspensionActual.id_obra,
          updateSuspensionDto.justificacion || suspensionActual.justificacion,
        );
      }
      return this.responseService.success(
        id_suspension,
        'Actualizado Correctamente.',
      );
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async datosInformesSF(id_obra: number): Promise<any[]> {
    const query = `
    SELECT *
    FROM public."vista_reporte_memoOC"
    WHERE id_obra = $1
  `;

    return await this.suspensionRepositorio.query(query, [id_obra]);
  }

  remove(id: number) {
    return `This action removes a #${id} suspension`;
  }

   async listaSupension(data:SuspensionObraDto) {
     try {
       ;
       let query =
         `SELECT  * FROM public.vista_lista_suspension WHERE id_obra = $1 ORDER BY id_suspension DESC;  `;
       const params: any[] = [data.id_obra];
       const resultado: any[] = await this.suspensionRepositorio.query(query, params);
       return this.responseService.success(resultado, "Listado Correctamente.")
     } catch (error) {
       return this.responseService.error(error);
     }
   }

  async listaSupensionXObra(data:SuspensionObraDto) {
     try {
       ;
       let query =
         `SELECT  * FROM public.vista_lista_suspension_codigo WHERE id_obra = $1;  `;
       const params: any[] = [data.id_obra];
       const resultado: any[] = await this.suspensionRepositorio.query(query, params);
       return this.responseService.success(resultado, "Listado Correctamente.")
     } catch (error) {
       return this.responseService.error(error);
     }
   }
  //   async listaHijosTotal(data: { id_obra: number; id_total: number }) {
  //   const query = `
  //     SELECT id_suspension, id_obra, suspension
  //     FROM public.vista_lista_suspension_hijos_totales
  //     WHERE id_obra = $1 AND id_padre_suspension = $2
  //     ORDER BY id_suspension DESC;
  //   `;
  //   const params = [data.id_obra, data.id_total];
  //   const resultado = await this.suspensionRepositorio.query(query, params);
  //   return this.responseService.success(resultado, "Listado Correctamente.");
  // }
  async listaHijosTotal(data: { id_obra: number; id_total: number }) {
    const query = `
    SELECT s.id_suspension,
           s.id_obra,
           (v.cod_carpeta || '-' || p.detalle || '-' || c.correlativo::text) AS suspension
    FROM suspension s
    JOIN memorandum m ON s.id_memo = m.id_memo
    JOIN correlativo c ON m.id_correlativo = c.id_correlativo
    JOIN datos_generales_x_obra v ON s.id_obra = v.id_obra
    JOIN (SELECT id_subtipo, detalle FROM parametrica WHERE id_tipo = 45) p
      ON s.id_tipo_suspension = p.id_subtipo
    WHERE s.id_obra = $1
      AND s.id_padre_suspension = $2
      AND s.id_tipo_suspension = 379
      AND s.id_estado = 1
      AND c.id_estado = 1
      AND s.finalizado = true
      AND NOT EXISTS (
        SELECT 1
        FROM reinicio r
        WHERE r.id_suspension = s.id_suspension
          AND r.id_estado = 1
      )
    ORDER BY s.id_suspension DESC;
  `;
    const params = [data.id_obra, data.id_total];
    const resultado = await this.suspensionRepositorio.query(query, params);
    return this.responseService.success(resultado, "Listado Correctamente.");
  }

  async puedeCrearTotal(id_obra: number) {
    const q = `
    SELECT 1
    FROM suspension s
    LEFT JOIN reinicio r
      ON r.id_suspension = s.id_suspension AND r.id_estado = 1
    WHERE s.id_obra = $1
      AND s.id_estado = 1
      AND s.id_tipo_suspension = 380
      AND (
        s.finalizado = false
        OR (s.finalizado = true AND (r.id_reinicio IS NULL OR r.finalizado <> true))
      )
    LIMIT 1;
  `;
    const existe = await this.suspensionRepositorio.query(q, [id_obra]);

    if (existe.length) {
      return this.responseService.success(
        { permitir: false, motivo: 'Existe una TOTAL vigente (finalice suspensión + reinicio).' },
        'OK'
      );
    }
    return this.responseService.success({ permitir: true, motivo: null }, 'OK');
  }

  async validarBloqueoNuevaSuspension(id_obra: number) {
    const query = `
            SELECT EXISTS (
          SELECT 1
          FROM suspension s
          LEFT JOIN LATERAL (
            SELECT r1.id_reinicio, r1.finalizado
            FROM reinicio r1
            WHERE r1.id_suspension = s.id_suspension
              AND r1.id_estado = 1
            ORDER BY r1.id_reinicio DESC
            LIMIT 1
          ) r ON true
          WHERE s.id_obra = $1
            AND s.id_estado = 1
            AND s.id_tipo_suspension = 380
            AND (
              s.finalizado = false
              OR r.id_reinicio IS NULL
              OR r.finalizado = false
            )
        ) AS bloqueado;
    `;
    const [row] = await this.suspensionRepositorio.query(query, [id_obra]);
    return this.responseService.success(
      { bloqueado: row?.bloqueado === true },
      'Validación realizada.'
    );
  }


  async enviarCorreoFinalizacionSuspension(id_obra: number, justificacion: string) {
    const datosSF: any[] = await this.datosInformesSF(id_obra);
    const info: any = datosSF?.[0];
    console.log('=== CORREO SUSPENSIÓN ===');
    console.log('id_obra:', id_obra);
    console.log('usuario_fis:', info?.usuario_fis);
    console.log('usuario_sup:', info?.usuario_sup);
    console.log('justificacion:', justificacion);


  if (!info?.usuario_fis || !info?.usuario_sup) {
    console.log('No se encontró usuario fiscal o supervisor para enviar correo.');
    return;
  }

  const respCorreo = await this.correoService.enviarCorreoProceso({
    para: [
      info.usuario_fis,
    ],
    autor: [
      info.usuario_sup,
    ],
    codigoObra: String(id_obra),
    nombreObra: info.referencia || '',
    actividad: 'SUSPENSIÓN DE OBRA FINALIZADA',
    proveido: justificacion || 'Se finalizó la suspensión de obra.', // aca debe ir la justificacion de la suspencion
  });
  console.log('Respuesta envío de correo:', respCorreo);
}

   /////////////////////////////////////////////////////////////////////////////////////////////

  async createReinicio(createReinicioDto: CreateReinicioDto) {
    try {



      const correlativoMemoRes = await this.correlativoService.create({
        id_obra: createReinicioDto.id_obra,
        id_tipo_documento: 373,
        correlativo: '',
        usuario_registro: createReinicioDto.id_usuario,
        id_estado: 1
      });
      const idCorrelativoMemo = correlativoMemoRes.data.id_correlativo;
      if (correlativoMemoRes.statusCode !== 200) {
        throw new Error('Error al generar correlativo del memorandum');
      }

   


         const data_memo = {
        "id_obra": createReinicioDto.id_obra,
        "id_tipo_memo": 373,
        "id_correlativo": idCorrelativoMemo,
        "fecha_memo": new Date(),
        "nombre_destinatario": "",
        "referencia": "",
        "descripcion": "",
        "nombre_remitente": "",
        "cargo_remitente": "",
        "id_estado": 1,
        "id_usuario": createReinicioDto.id_usuario,
      };
      const resultado_memo_re = await this.memoService.create(data_memo);
      createReinicioDto.id_memo = resultado_memo_re.data.id_memo;
      
      const resultadoReinicio = await this.reinicioRepositorio.save(createReinicioDto);

        if (!resultadoReinicio) {
        throw new Error('No se pudo crear la suspension');
      }
  
      const datos = {
        id_tipo_memo: 373,
        id_obra: createReinicioDto.id_obra,
        id_memo: resultado_memo_re.data.id_memo,
      }

      const encabezado = await this.memoService.crearencabezadoDocumentos(datos)
      if (!encabezado) {
        throw new Error('No se pudo crear el encabezado de documentos');
      }
      return this.responseService.success(resultadoReinicio, "Registrado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

//   async listaSuspensionParaReinicio(data: { id_obra: number; id_suspension: number }) {
//   const query = `
//     SELECT s.id_suspension,
//            s.id_obra,
//            (v.cod_carpeta || '-' || p.detalle || '-' || c.correlativo::text) AS suspension
//     FROM suspension s
//     JOIN memorandum m ON s.id_memo = m.id_memo
//     JOIN correlativo c ON m.id_correlativo = c.id_correlativo
//     JOIN datos_generales_x_obra v ON s.id_obra = v.id_obra
//     JOIN (SELECT id_subtipo, detalle FROM parametrica WHERE id_tipo = 45) p
//       ON s.id_tipo_suspension = p.id_subtipo
//     WHERE s.id_estado = 1
//       AND c.id_estado = 1
//       AND s.finalizado = true
//       AND s.id_obra = $1
//       AND s.id_suspension = $2
//       AND NOT EXISTS (
//         SELECT 1 FROM reinicio r
//         WHERE r.id_suspension = s.id_suspension AND r.id_estado = 1
//       )
//   `;
//   const params = [data.id_obra, data.id_suspension];
//   const resultado = await this.suspensionRepositorio.query(query, params);
//   return this.responseService.success(resultado, "Listado Correctamente.");
// }

async listaSuspensionParaReinicio(data: { id_obra: number; id_suspension: number }) {
  const query = `
    SELECT s.id_suspension,
           s.id_obra,
           (v.cod_carpeta || '-' || p.detalle || '-' || c.correlativo::text) AS suspension
    FROM suspension s
    JOIN memorandum m ON s.id_memo = m.id_memo
    JOIN correlativo c ON m.id_correlativo = c.id_correlativo
    JOIN datos_generales_x_obra v ON s.id_obra = v.id_obra
    JOIN (SELECT id_subtipo, detalle FROM parametrica WHERE id_tipo = 45) p
      ON s.id_tipo_suspension = p.id_subtipo
    WHERE s.id_estado = 1
      AND c.id_estado = 1
      AND s.finalizado = true
      AND s.id_obra = $1
      AND s.id_suspension = $2
  `;

  const params = [data.id_obra, data.id_suspension];
  const resultado = await this.suspensionRepositorio.query(query, params);

  return this.responseService.success(resultado, "Listado Correctamente.");
}


    async findOneReinicio(id_reinicio: number) {
    try {
      const resultado = await this.reinicioRepositorio.findOneBy({ id_reinicio });
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }


  async updateReinicio(id_reinicio: number, updateReinicioDto: UpdateReinicioDto) {
    try {
      const resultado = await this.reinicioRepositorio.update(id_reinicio, updateReinicioDto)
      return this.responseService.success(id_reinicio, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }        
  }

}
