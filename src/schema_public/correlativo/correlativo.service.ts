import { Injectable } from '@nestjs/common';
import { CreateCorrelativoDto } from './dto/create-correlativo.dto';
import { UpdateCorrelativoDto } from './dto/update-correlativo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { Correlativo } from './entities/correlativo.entity';
import { ResponseService } from 'src/response.service';

@Injectable()
export class CorrelativoService {
  constructor(@InjectRepository(Correlativo) private coorrelativoRepo: Repository<Correlativo>,
    private responseService: ResponseService, 
  ) { }


  async create(createCorrelativoDto: CreateCorrelativoDto) {
    try {    
      const productCount = await this.coorrelativoRepo
      const query = `
      SELECT COUNT(*) 
      FROM correlativo 
      WHERE id_obra = $1 
        AND id_tipo_documento = $2
    `;
    const values = [
      createCorrelativoDto.id_obra,
      createCorrelativoDto.id_tipo_documento,
    ];
    const result = await this.coorrelativoRepo.query(query, values);
    const count = parseInt(result[0].count, 10);    
      //return productCount;
      let numero_correlativo =  this.countNumber(count+1,0)
      createCorrelativoDto.correlativo = numero_correlativo.toString();
   const resultado = await this.coorrelativoRepo.save(createCorrelativoDto);     
    //return this.coorrelativoRepo.save(createCorrelativoDto);      
    return this.responseService.success( resultado, "Registrado Correctamente.")
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
}
