import { Injectable } from '@nestjs/common';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { And, Any, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseService } from 'src/response.service';
import { Obra } from '../obra/entities/obra.entity';
import { CorrelativoMemo } from '../correlativo_memo/entities/correlativo_memo.entity';
import { log } from 'console';
import { Designacion } from './entities/designacion.entity';
import { EstadoObraDesigDto } from './dto/estado_obra_designacion.dto';
import { MaxCorrelativoDto } from './dto/correlativo.dto';
import { ReemplazoDto } from './dto/reemplazo.dto';


@Injectable()
export class DesignacionService {

  constructor(
    @InjectRepository(Designacion) private DesigRepositorio: Repository<Designacion>,
    @InjectRepository(Obra) private obraRepositorio: Repository<Obra>,
    @InjectRepository(CorrelativoMemo) private correlativoRepositorio: Repository<CorrelativoMemo>,
    private responseService: ResponseService

  ) { }

  async create(createDesignacionDto: CreateDesignacionDto) {
    try {
      //inicio 
      //si existe la obra  adiciono la solicitud de designacion 
     /* const siexiste = await this.findOneObra(createDesignacionDto.id_ficha)
      if (siexiste) {
        const data_correlativo = {
          "id_obra": createDesignacionDto.id_obra,
          "correlativo_memo": createDesignacionDto.correlativo_memo,
          "usuario_registro": createDesignacionDto.usuario_registro,
          "id_estado": 1
        };
       const v_id_correlativo_memo = await this.create_correlativo(data_correlativo) 
       createDesignacionDto.id_correlativo_memo =  v_id_correlativo_memo.id_correlativo_memo              
        const resultado = await this.DesigRepositorio.save(createDesignacionDto);                   

        return this.responseService.success(resultado, "Guardado Correctamente.")
      }
      else {
        const data_obra = {
          "id_ficha": createDesignacionDto.id_ficha,
          "id_tipo_obra": 0,
          "id_modalidad": 0,
          "id_estado_general": 1,// SOLICITADO
          "usuario_registro": createDesignacionDto.usuario_registro,
          "id_estado": 1
        };
        const v_obra = await this.create_obra(data_obra)
        createDesignacionDto.id_obra = v_obra.data.id_obra;*/
        let id_ficha = createDesignacionDto.id_ficha;
        const v_id_obra = await this.obraRepositorio.findOne({ where: { id_ficha } });
      if (v_id_obra?.id_obra) { createDesignacionDto.id_obra = v_id_obra.id_obra; }

      const data_correlativo = {
        "id_obra": createDesignacionDto.id_obra,
        "correlativo_memo": createDesignacionDto.correlativo_memo,
        "usuario_registro": createDesignacionDto.usuario_registro,
        "id_estado": 1
      };
      const v_id_correlativo_memo = await this.create_correlativo(data_correlativo)
      createDesignacionDto.id_correlativo_memo = v_id_correlativo_memo.id_correlativo_memo
      const resultado = await this.DesigRepositorio.save(createDesignacionDto);

      if (resultado) { await this.updateDesignacionestadoXPersona(createDesignacionDto.id_obra); }
      await this.update_obra_estado(2, v_id_correlativo_memo.id_obra);// ESTADO 2 SOLICITADO
      return this.responseService.success(resultado, "Guardado Correctamente.")
      /*  }*/

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async create_obra(createObra: any) {
    try {
      const resultado = await this.obraRepositorio.save(createObra);
      return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all solicitudDesignacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitudDesignacion`;
  }

 async update(id_designacion: number, updateDesignacionDto: UpdateDesignacionDto) {
    try {
      const resultado = await this.DesigRepositorio.update(id_designacion, updateDesignacionDto)
      return this.responseService.success(id_designacion, "Actualizado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} solicitudDesignacion`;
  }

  async findOneObra(id_ficha: number): Promise<boolean> {
    
    const user = await this.obraRepositorio.findOne({ where: { id_ficha } });
    return !!user; // Devuelve true si la obra existe, de lo contrario false  
  }


  async create_correlativo(createCorrelativoDto: any) {
   /* const query = `
    SELECT COUNT(*)
    FROM correlativo_memo
    WHERE id_obra = ${createCorrelativoDto.id_obra}`;
    const result = await this.correlativoRepositorio.query(query);

    const count = parseInt(result[0].count, 10);
    let correlativo_memo = count + 1;*/
    //createCorrelativoDto.correlativo_memo = correlativo_memo;
    const v_correlativo = await this.correlativoRepositorio.save(createCorrelativoDto)
    return v_correlativo;
  }



  async update_obra_estado(id_estado_gral: number, id_obra:number) {
    try {
      const query1 = `
      UPDATE public.obra
      SET "id_estado_general" = $1
      WHERE id_obra = $2`;
      const params = [id_estado_gral, id_obra];  
      await this.obraRepositorio.query(query1, params);  
      return {
        statusCode: 200,
        message: true,
        data: "Se actualizaron datos",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }


  async updateDesignacionestadoXPersona(id_obra: number) {
    try {
      const query1 = `
      UPDATE public.designacion
      SET id_estado = 0
      WHERE id_persona IN (-1,-2)  AND id_obra =$1`;
      const params = [id_obra];
      const resultado = await this.obraRepositorio.query(query1, params);
      return {
        statusCode: 200,
        message: true,
        data: resultado,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }

  async update_designacion_estado(estado_designacion: number, id_designacion:number) {
    try {
      const query2 = `
      UPDATE  public.designacion
      SET "estado_designacion" =$1
      WHERE id_designacion =$2`;
      const params3 = [estado_designacion, id_designacion];  
      await this.DesigRepositorio.query(query2, params3);  
      return {
        statusCode: 200,
        message: true,
        data: "Se actualizaron datos",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }  

 async aprobarDesignacion(id_designacion: number, estadoDto:EstadoObraDesigDto) {
  try {

  const res =await  this.update_designacion_estado(estadoDto.estado_designacion, id_designacion);   
  if(res)
  await   this.update_obra_estado(estadoDto.estado_general, estadoDto.id_obra);
  return this.responseService.success(res, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }  

  async deleteDesignacionestadoXPersona(id_obra: number) {
    try {
      const query1 = `
      DELETE FROM  public.designacion      
      WHERE id_persona IN (-1,-2)  AND id_obra =$1`;
      const params = [id_obra];
      const resultado = await this.obraRepositorio.query(query1, params);
      return {
        statusCode: 200,
        message: true,
        data: resultado,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: false,
      };
    }
  }

  async rechazarDesignacion(id_designacion: number, id_obra:number) {
    try {
      const query1 = `
      DELETE FROM public.designacion   
      WHERE id_designacion = $1`;
      const params = [ id_designacion];  
      await this.DesigRepositorio.query(query1, params);  

      const query2 = `
        DELETE FROM correlativo_memo  cm
      WHERE id_correlativo_memo IN(
      SELECT cm.id_correlativo_memo FROM correlativo_memo AS cm
      INNER JOIN designacion AS d ON cm.id_correlativo_memo = d.id_correlativo_memo WHERE d.id_designacion = $1) `;
      const params2 = [ id_designacion];  
    const resultado =  await this.DesigRepositorio.query(query2, params2); 

      const query3 = `
      UPDATE  obra  as o
      SET id_estado_general =1
      WHERE o.id_obra IN(
      SELECT o.id_obra FROM obra AS o
      INNER JOIN designacion AS d ON o.id_obra = d.id_obra WHERE d.id_designacion = $1) `;
      const params3 = [id_designacion];
      await this.DesigRepositorio.query(query3, params3);
      await this.deleteDesignacionestadoXPersona(id_obra);

      return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }


async maxCorrelativo( correlativoDto: MaxCorrelativoDto) {
  try {
    const query1 = `
    SELECT COALESCE(MAX(correlativo_memo),0) AS max_correlativo FROM designacion AS d
    INNER JOIN public.persona AS p ON d.id_persona = p.id_persona
    INNER JOIN correlativo_memo AS  cm ON d.id_correlativo_memo= cm.id_correlativo_memo
    INNER JOIN LATERAL (SELECT * FROM public.sp_descripcion_permiso(p.id_persona)) AS dp ON p.id_persona = dp.idpersona		
    WHERE d.id_obra = $1 AND dp.idpermisod IN($2 ) `;
    const params = [ correlativoDto.id_obra, correlativoDto.id_permiso];  
   const resultado = await this.DesigRepositorio.query(query1, params);      
    return this.responseService.success(resultado,  "Listado Correctamente.")
  } catch (error) {
    return this.responseService.error(error);
  }
}

async actualizarReemplazar(id_designacion: number, reemplazoDto:ReemplazoDto) {
  try {

    const resultado = await this.DesigRepositorio.update(id_designacion, reemplazoDto)
    if(resultado)
  return this.responseService.success(resultado, "Guardado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }

}
