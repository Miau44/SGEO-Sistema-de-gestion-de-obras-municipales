import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { LoginExternoDto } from './dto/login-externo.dtos';
import { ResponseService } from 'src/response.service';
import { LogService } from 'src/schema_public/log/log.service';
import { CreateLogDto } from 'src/schema_public/log/dto/create-log.dto';
import { ObraService } from 'src/schema_public/obra/obra.service';
import { ObraExternoDto } from './dto/obra.dto';
import { log } from 'node:console';
import { ParametricaService } from 'src/schema_public/parametrica/services/parametrica.service';
import { DataSource } from 'typeorm';


@Injectable()
export class ExternoService {
  
  constructor(
    private readonly responseService: ResponseService,
    private readonly logService: LogService,
    private readonly obraService: ObraService,
    private readonly parametricaService: ParametricaService,
    private readonly dataSource: DataSource

  ) {

  
    let cachePrefijos: Set<string> | null = null;
    let cacheTime = 0;

  }

  create(createExternoDto: CreateExternoDto) {
    return 'This action adds a new externo';
  }

  findAll() {
    return `This action returns all externo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} externo`;
  }

  update(id: number, updateExternoDto: UpdateExternoDto) {
    return `This action updates a #${id} externo`;
  }

  remove(id: number) {
    return `This action removes a #${id} externo`;
  }



  //http://192.168.8.4:3007/api/v1/servicio/login
  // async logeo(loginDto:LoginExternoDto) {
  //   try {
            
  //     const url = process.env.URL_SEGURIDAD+'login';
  //     const options = {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         "usuario": loginDto.usuario,
  //         "clave": loginDto.clave,
  //         "sistema": "SGEO"
  //       })
  //     };
  //     //console.log('este es el console', url, options);
  //     const response = await fetch(url, options);
  //     const resultado = await response.json();
  //     if (resultado) {
  //       return resultado;
  //     }
  //   } catch (error) {
  //     return {
  //     //  mensaje: error.message,
  //       estado: false,
  //       data: null,
  //     };
  //   }
  // }  

  async logeo(loginDto: LoginExternoDto) {
    const url = process.env.URL_SEGURIDAD + 'login';
    const payload = {
      usuario: loginDto.usuario,
      clave: loginDto.clave,
      sistema: 'SGEO',
    };

    const payloadLog = {
      usuario: loginDto.usuario
    };
  
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  
    try {
      const response = await fetch(url, options);
      const resultado = await response.json();
      
    //   const respuestaLog = {
    //   statusCode: resultado?.statusCode ?? null,
    //   message: resultado?.message ?? null,
    //   id_usuario: resultado?.data?.id_usuario ?? 0,
    // };
  
      await this.logService.create({
        id_usuario: resultado?.data?.id_usuario ?? 0,
        parametro: JSON.stringify(payloadLog),
        mensaje: 'Login exitoso',
        funcionalidad: 'login',
        respuesta: JSON.stringify(resultado),
      });
  
      return resultado;
    } catch (error: any) {
      await this.logService.create({
        id_usuario: 0,
        parametro: JSON.stringify(payload),
        mensaje: 'Error al intentar iniciar sesión',
        funcionalidad: 'login',
        respuesta: error?.message ?? 'Error desconocido',
      });
  
      return {
        estado: false,
        data: null,
      };
    }
  }


  async sgpuItemsVigentes(datos: ObraExternoDto) {
    try {
            
    //  const url = 'http://localhost:3004/item/sgeo-item-vigente';
      const url =  process.env.URL_SGPU+ 'item/sgeo-item-vigente';
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      /*  body: JSON.stringify({
          "usuario": loginDto.usuario,
          "clave": loginDto.clave,
          "sistema": "SGEO"
        })*/
      };

      //comentado por el tema del prefijo  y la respuesta que tarda mucho
      //funciona tambien
      /*   const prefijosValidos = (filtrar_habilitacion.data || [])
           .filter((item: any) => {
             const detalle = (item.detalle || '').trim();
             return detalle === ''; // null, vacío o solo espacios
           }).map((item: any) => item.desc_subtipo?.trim().toUpperCase());
   
           const sgpuFiltrados = resultado.data.filter((sgpu: any) => {
           const codigoItem = (sgpu?.codigoItem || '').trim().toUpperCase();
           return prefijosValidos.some((pref: any) => codigoItem.startsWith(pref));
         });
   
         if (sgpuFiltrados) {
           const respuesta_obra = await this.obraService.findOne(datos.id_obra);
           const codigo_carpeta = respuesta_obra.data[0].cod_carpeta;
           if (!codigo_carpeta) {
             throw new NotFoundException(`codigo obra with ID ${codigo_carpeta} not found`);
           }
             let prefijoSgpu = '';
             if (codigo_carpeta.startsWith('OBX') || codigo_carpeta.startsWith('OBN')) {
               prefijoSgpu = 'GM';
             } else if (codigo_carpeta.startsWith('EMA')) {
               prefijoSgpu = 'EI';
             } else if (codigo_carpeta.startsWith('EMV')) {
               prefijoSgpu = 'EV';
             }
           const sgpuFiltradosFinal = sgpuFiltrados.filter((sgpu: any) => {
             const codigoItem = (sgpu?.codigoItem || '').trim().toUpperCase();
             return codigoItem.startsWith(prefijoSgpu);
           });
   
           if (sgpuFiltrados.length === 0) {
           }
           return this.responseService.success(sgpuFiltradosFinal, "Listado Correctamente.")*/

      

      try {
        const response = await fetch(url!, options);
        const resultado = await response.json();

        const parametricaResp = await this.parametricaService.listarXTipo({
        id: 43,
        campo: 'id_tipo'
      });
      const listaParametrica = parametricaResp?.data || [];

        const prefijosValidos = await this.obtenerPrefijosValidos(this.parametricaService.listarXTipo({ id: 43, campo: 'id_tipo' }));
        const obra = await this.obraService.findOne(datos.id_obra);
        const carpeta = obra?.data?.[0]?.cod_carpeta?.toUpperCase();

        let prefijoObra = "";
        if (carpeta.startsWith("OBX") || carpeta.startsWith("OBN")) 
          prefijoObra = "GM";
        else if (carpeta.startsWith("EMA")) 
          prefijoObra = "EI";
        else if (carpeta.startsWith("EMV")) 
          prefijoObra = "EV";

         // Buscar el registro de la paramétrica para el prefijo actual
        const registroPrefijo = listaParametrica.find((item: any) =>
          (item.desc_subtipo || '').trim().toUpperCase() === prefijoObra
        );

        const detallePrefijo = (registroPrefijo?.detalle || '').trim();

        //       console.log('carpeta =>', carpeta);
        // console.log('prefijoObra =>', prefijoObra);
        // console.log('listaParametrica =>', listaParametrica);
        // console.log('registroPrefijo =>', registroPrefijo);
        // console.log('detallePrefijo =>', detallePrefijo);

        // BLOQUEO TEMPORAL
        if (detallePrefijo !== '') {
          return {
            statusCode: 200,
            message: 'Bloqueo temporal.',
            bloqueoTemporal: true,
            detalleBloqueo: detallePrefijo,
            data: []
          };
      }

        const filtrados = [];
        for (const item of resultado.data) {
          const cod = item.codigoItem?.toUpperCase();
          if (!cod) continue;
          const pref = cod.substring(0, 2);
          if (!prefijosValidos.has(pref)) continue;

          if (cod.startsWith(prefijoObra)) {
            filtrados.push(item);
          }
        }

        return this.responseService.success(filtrados, "Listado correctamente.");

      } catch (error: any) {
        console.error("ERROR SGPU:", error);
        throw new InternalServerErrorException(error.message);
      }
    } catch (error) {
      return this.responseService.error(error);
    }

  }

  async obtenerPrefijosValidos(servicio: any): Promise<Set<string>> {
    let cachePrefijos: Set<string> | null = null;
    let cacheTime = 0;
    const ahora = Date.now();
    if (cachePrefijos && (ahora - cacheTime < 5 * 60 * 1000)) {
      return cachePrefijos;
    }
    const habilitaciones = await servicio;

    if (!habilitaciones?.data || !Array.isArray(habilitaciones.data)) {
      throw new Error("Error obteniendo habilitaciones");
    }

    cachePrefijos = new Set(
      habilitaciones.data
        .filter((item: any) => (item.detalle || "").trim() === "")
        .map((item: any) => (item.desc_subtipo || "").trim().toUpperCase())
    );

    cacheTime = ahora;

    return cachePrefijos;
  }

async sgpuItemsVigentesexterno() {
  try {

     const url =  process.env.URL_SGPU+ 'item/sgeo-item-vigente';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await fetch(url!, options);
    const resultado = await response.json();

    // 👉 SOLO DEVUELVE TODO SIN FILTRAR
    return this.responseService.success(
      resultado.data || [],
      "Listado correctamente."
    );

  } catch (error: any) {
    console.error("ERROR SGPU:", error);
    throw new InternalServerErrorException(error.message);
  }
}

  async obtenerConsultaExterna(idContratoDlc: number, nroModificacion: number) {
  // 1. Obtener datos de obra
  const obraQuery = `
    SELECT * 
    FROM public.sp_consulta_externa_obra(NULL, $1)
  `;

  const obraResult = await this.dataSource.query(obraQuery, [idContratoDlc]);

  if (!obraResult.length) {
    return {
      obra: null,
      contexto: null,
      documentos: [],
      actas: []
    };
  }

  const obra = obraResult[0];

  // 2. Buscar modificación asociada a la obra
  const contextoQuery = `
    SELECT *
    FROM (
      SELECT 
        mp.id_solicitud,
        m.id_modificacion,
        mp.id_modificacion_pago,
        mp.id_tipo_mod_pago,
        ROW_NUMBER() OVER (ORDER BY m.fecha_registro ASC) AS nro_modificacion,
        CASE 
          WHEN mp.id_tipo_mod_pago = 1 THEN 266
          WHEN mp.id_tipo_mod_pago = 2 THEN 268
          WHEN mp.id_tipo_mod_pago = 3 THEN 268
          ELSE NULL
        END AS id_tipo_informe
      FROM public.modificacion_pago mp
      INNER JOIN public.modificacion m 
        ON m.id_modificacion_pago = mp.id_modificacion_pago
      WHERE mp.id_obra = $1
        AND mp.id_estado = 1
        AND m.id_estado = 1
    ) x
    WHERE x.nro_modificacion = $2
    LIMIT 1
  `;

  const contextoResult = await this.dataSource.query(contextoQuery, [obra.id_obra, nroModificacion]);

  if (!contextoResult.length) {
    return {
      obra,
      contexto: null,
      documentos: [],
      actas: []
    };
  }

  const contexto = contextoResult[0];

  if (!contexto.id_tipo_informe) {
    return {
      obra,
      contexto,
      documentos: [],
      actas: []
    };
  }

  // 3. Obtener documentos del informe
  const documentosQuery = `
    SELECT *
    FROM public.sp_obtener_datos_formulario($1, $2, $3)
  `;

  const formularioResult = await this.dataSource.query(documentosQuery, [
    contexto.id_solicitud,
    contexto.id_modificacion,
    contexto.id_tipo_informe
  ]);

  const documentos = formularioResult?.[0]?.documentos || [];

  // 4. Obtener documentos de archivo_acta
  const actasQuery = `
    SELECT 
      doc.id_documento,
      doc.ruta_documento,
      doc.nombre_documento,
      TO_CHAR(doc.fecha_registro, 'DD/MM/YYYY HH24:MI:SS') AS fecha_registro,
      aa.id_archivo_acta,
      aa.id_tipo_recepcion,
      aa.id_solicitud
    FROM public.archivo_acta aa
    INNER JOIN public.documento doc 
      ON doc.id_documento = aa.id_documento
    WHERE aa.id_obra = $1
      AND aa.id_solicitud = $2
      AND aa.id_estado = 1
      AND aa.id_documento IS NOT NULL
    ORDER BY aa.fecha_registro DESC
  `;

  const actas = await this.dataSource.query(actasQuery, [
    obra.id_obra,
    contexto.id_solicitud
  ]);

  return {
    obra,
    contexto,
    documentos,
    actas
  };  
}

  async obtenerReporteGeneral(correlativo_carpeta: number) {
    try {
      const [data] = await this.dataSource.query(
        `
      SELECT *
      FROM vista_reporte_general
      WHERE correlativo_carpeta = $1
      LIMIT 1
      `,
        [correlativo_carpeta],
      );

      return {
        ok: true,
        data: data || null,
      };
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        mensaje: 'Error al consultar reporte general',
        error: mensajeError,
      };
    }
  }

}




