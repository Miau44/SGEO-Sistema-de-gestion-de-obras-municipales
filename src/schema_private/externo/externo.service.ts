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


@Injectable()
export class ExternoService {
  
  constructor(
    private readonly responseService: ResponseService,
    private readonly logService: LogService,
    private readonly obraService: ObraService,
    private readonly parametricaService: ParametricaService
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


}




