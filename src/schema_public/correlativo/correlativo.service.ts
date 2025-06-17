import { Injectable } from '@nestjs/common';
import { CreateCorrelativoDto } from './dto/create-correlativo.dto';
import { UpdateCorrelativoDto } from './dto/update-correlativo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Correlativo } from './entities/correlativo.entity';
import { ResponseService } from 'src/response.service';
import { TipoInformeDto } from './dto/tipo_informe.dto';

@Injectable()
export class CorrelativoService {
  constructor(@InjectRepository(Correlativo) private coorrelativoRepo: Repository<Correlativo>,
    private responseService: ResponseService, 
  ) { }

async create(createCorrelativoDto: CreateCorrelativoDto) {
    try {
      const gruposEspeciales = [
        [235,295,237,238], 
        [236,296],     
      ];
  
      let count = 0;
      let grupoEncontrado: number[] | null = null;
  

      for (const grupo of gruposEspeciales) {
        if (grupo.includes(createCorrelativoDto.id_tipo_documento)) {
          grupoEncontrado = grupo;
          break;
        }
      }
  
      if (grupoEncontrado) {
 
        const query = `
          SELECT COUNT(*) FROM correlativo 
          WHERE id_obra = $1 AND id_tipo_documento = ANY($2) AND id_estado = 1;`;
        const values = [
          createCorrelativoDto.id_obra,
          grupoEncontrado,
        ];
        const result = await this.coorrelativoRepo.query(query, values);
        count = parseInt(result[0].count, 10);
      } else {

        const query = `
          SELECT COUNT(*) FROM correlativo 
          WHERE id_obra = $1 AND id_tipo_documento = $2 AND id_estado = 1 `;
        const values = [
          createCorrelativoDto.id_obra,
          createCorrelativoDto.id_tipo_documento,
        ];
        const result = await this.coorrelativoRepo.query(query, values);
        count = parseInt(result[0].count, 10);
      }

      const numero_correlativo = this.countNumber(count + 1, 0);
      createCorrelativoDto.correlativo = numero_correlativo.toString();
  
      const resultado = await this.coorrelativoRepo.save(createCorrelativoDto);
      return this.responseService.success(resultado, "Registrado Correctamente.");
    } catch (error: any) {
      return this.responseService.error(error);
    }
    
  }



  async createNormal(createCorrelativoDto: CreateCorrelativoDto) {
    try {
      const productCount = await this.coorrelativoRepo
      const query = `
      SELECT COUNT(*) FROM correlativo  
      WHERE id_obra = $1  AND id_tipo_documento = $2 AND id_estado = 1;`;
      const values = [
        createCorrelativoDto.id_obra,
        createCorrelativoDto.id_tipo_documento,
      ];
      const result = await this.coorrelativoRepo.query(query, values);
      const count = parseInt(result[0].count, 10);
      //return productCount;
      let numero_correlativo = this.countNumber(count + 1, 0)
      createCorrelativoDto.correlativo = numero_correlativo.toString();
      const resultado = await this.coorrelativoRepo.save(createCorrelativoDto);
      //return this.coorrelativoRepo.save(createCorrelativoDto);      
      return this.responseService.success(resultado, "Registrado Correctamente.")
    } catch (error: any) {
      return this.responseService.error(error);
    }

  }


  countNumber(number: any, width: number): string {
    if (!Number.isInteger(number)) {
      throw new Error('El número proporcionado debe ser un entero.');
    }
    const numberOutput = Math.abs(number); /* Valor absoluto del número */
    const length = numberOutput.toString().length; /* Largo del número */
    const zero = "0"; /* String de ceros */

    if (width <= length) {
      return number < 0
        ? `-${numberOutput.toString()}`
        : numberOutput.toString();
    } else {
      const padding = zero.repeat(width - length);
      return number < 0
        ? `-${padding}${numberOutput.toString()}`
        : `${padding}${numberOutput.toString()}`;
    }
  }
  

  findAll() {
    return `This action returns all correlativo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} correlativo`;
  }

  update(id: number, updateCorrelativoDto: UpdateCorrelativoDto) {
    return `This action updates a #${id} correlativo`;
  }

  remove(id: number) {
    return `This action removes a #${id} correlativo`;
  }
async actualizarFaltantes(data: TipoInformeDto) {
  const informes: any[] = await this.coorrelativoRepo.query(`
    SELECT id_informe, i.id_obra, id_tipo_informe, i.usuario_registro
    FROM informe AS i
    LEFT JOIN correlativo AS c ON i.id_correlativo = c.id_correlativo
    WHERE id_tipo_informe = ${data.id_tipo_informe} AND i.id_correlativo IS NULL
  `);

  if (!informes || informes.length === 0) {
    throw new Error("No se encontraron informes para actualizar.");
  }

  let actualizados = 0;

  for (const { id_informe, id_obra, usuario_registro } of informes) {
    const correlativoInformeRes = await this.createNormal({
      id_obra: id_obra,
      id_tipo_documento: data.id_tipo_informe,
      correlativo: '',
      usuario_registro: usuario_registro,
      id_estado: 1
    });

    if (
      !correlativoInformeRes ||
      correlativoInformeRes.statusCode !== 200 ||
      !correlativoInformeRes.data?.id_correlativo
    ) {
      throw new Error(`Error al generar correlativo para el informe ${id_informe}`);
    }

    const nuevoCorrelativo = correlativoInformeRes.data.id_correlativo;
    const result = await this.coorrelativoRepo.query(
      `
      UPDATE public.informe
      SET id_correlativo = $1
      WHERE id_informe = $2 AND id_estado = 1;
      `,
      [nuevoCorrelativo, id_informe]
    );

    // Si usas pg-promise o node-postgres, `result.rowCount` da el número de filas afectadas
    // Pero en query plano puedes asumir que si no falla, fue 1.
    actualizados++;
  }

  return {
    mensaje: `Se actualizaron ${actualizados} informes correctamente.`,
    total: actualizados,
  };
}



}
