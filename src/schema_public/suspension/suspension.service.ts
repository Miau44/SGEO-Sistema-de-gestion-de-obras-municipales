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


@Injectable()
export class SuspensionService {

  constructor(
    @InjectRepository(Suspension) private suspensionRepositorio: Repository<Suspension>,
    @InjectRepository(Reinicio) private reinicioRepositorio: Repository<Reinicio>,    

    private responseService: ResponseService,
    private correlativoService: CorrelativoService,
    private memoService: MemorandumService,
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

    // 4) ABSORCIÓN: si es TOTAL (380)
    if (createSuspensionDto.id_tipo_suspension === 380) {
      await this.suspensionRepositorio.update(
        {
          id_obra: createSuspensionDto.id_obra,
          id_tipo_suspension: 379,
          finalizado: true,
          id_estado: 1,
          id_padre_suspension: IsNull(),
        },
        { id_padre_suspension: resultado.id_suspension }
      );
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


  async update(id_suspension: number, updateSuspensionDto: UpdateSuspensionDto) {
    try {
      const resultado = await this.suspensionRepositorio.update(id_suspension, updateSuspensionDto)
      return this.responseService.success(id_suspension, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }        
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
