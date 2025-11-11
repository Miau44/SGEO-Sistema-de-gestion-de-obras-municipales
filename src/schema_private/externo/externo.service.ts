import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { LoginExternoDto } from './dto/login-externo.dtos';
import { ResponseService } from 'src/response.service';
import { LogService } from 'src/schema_public/log/log.service';
import { CreateLogDto } from 'src/schema_public/log/dto/create-log.dto';
import { ObraService } from 'src/schema_public/obra/obra.service';
import { ObraExternoDto } from './dto/obra.dto';
import { log } from 'node:console';


@Injectable()
export class ExternoService {
  
  constructor(
    private readonly responseService: ResponseService,
    private readonly logService: LogService,
    private readonly obraService: ObraService,
  ) {}

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
  
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  
    try {
      const response = await fetch(url, options);
      const resultado = await response.json();
  
      await this.logService.create({
        id_usuario: resultado?.data?.id_usuario ?? 0,
        parametro: JSON.stringify(payload),
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
      
      const response = await fetch(url!, options);
      const resultado = await response.json();

      if (resultado) {
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

        const sgpuFiltrados = resultado.data.filter((sgpu: any) => {
          const codigoItem = (sgpu?.codigoItem || '').trim().toUpperCase();
          return codigoItem.startsWith(prefijoSgpu);
        });
     
        if (sgpuFiltrados.length === 0) {          
        }  
        return this.responseService.success(sgpuFiltrados, "Listado Correctamente.")

      }
    } catch (error) {

 return this.responseService.error(error);      
      /*return {
        //  mensaje: error.message,
        estado: false,
        data: null,
      };*/
    }
  }
}
