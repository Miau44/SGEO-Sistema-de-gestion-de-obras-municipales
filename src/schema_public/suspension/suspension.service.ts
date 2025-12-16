import { Injectable } from '@nestjs/common';
import { CreateSuspensionDto } from './dto/create-suspension.dto';
import { UpdateSuspensionDto } from './dto/update-suspension.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Suspension } from './entities/suspension.entity';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { CorrelativoService } from '../correlativo/correlativo.service';
import { MemorandumService } from '../memorandum/memorandum.service';
import { Memorandum } from '../memorandum/entities/memorandum.entity';
import { SuspensionObraDto } from './suspension-obra.dto';


@Injectable()
export class SuspensionService {

  constructor(
    @InjectRepository(Suspension) private suspensionRepositorio: Repository<Suspension>,


    private responseService: ResponseService,
    private correlativoService: CorrelativoService,
    private memoService: MemorandumService,
  ) { }


  async create(createSuspensionDto: CreateSuspensionDto) {
    try {

      const correlativoMemoRes = await this.correlativoService.create({
        id_obra: createSuspensionDto.id_obra,
        id_tipo_documento: 243,
        correlativo: '',
        usuario_registro: createSuspensionDto.id_usuario,
        id_estado: 1
      });
      console.log('⬅️ Respuesta de correlativoService.create:', correlativoMemoRes);
      const idCorrelativoMemo = correlativoMemoRes.data.id_correlativo;

      if (correlativoMemoRes.statusCode !== 200) {
        throw new Error('Error al generar correlativo del memorandum');
      }

      const data_memo = {
        "id_obra": createSuspensionDto.id_obra,
        "id_tipo_memo": createSuspensionDto.id_tipo_suspension,
        "id_correlativo": idCorrelativoMemo,
        "fecha_memo": new Date(),
        "nombre_destinatario": "",
        "referencia": "",
        "descripcion": "",
        "nombre_remitente": "",
        "cargo_remitente": "",
        "id_estado": 1,
        "id_usuario": createSuspensionDto.id_usuario,
      };
      const resultado_memo = await this.memoService.create(data_memo);

      createSuspensionDto.id_memo = resultado_memo.data.id_memo;
      const resultado = await this.suspensionRepositorio.save(createSuspensionDto);

        if (!resultado) {
        throw new Error('No se pudo la suspension');
      }
  
      const datos = {
        id_tipo_memo: createSuspensionDto.id_tipo_suspension,
        id_obra: createSuspensionDto.id_obra,
        id_memo: resultado_memo.data.id_memo,
      }

      console.log('datos...', datos);

      const encabezado = await this.memoService.crearencabezadoDocumentos(datos)
      if (!encabezado) {
        throw new Error('No se pudo crear el encabezado de documentos');
      }


      return this.responseService.success(resultado, "Registrado Correctamente.")
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

  findOne(id: number) {
    return `This action returns a #${id} suspension`;
  }

  update(id: number, updateSuspensionDto: UpdateSuspensionDto) {
    return `This action updates a #${id} suspension`;
  }

  remove(id: number) {
    return `This action removes a #${id} suspension`;
  }

   async listaSupension(data:SuspensionObraDto) {
     try {
       ;
       let query =
         `SELECT  * FROM vista_lista_suspension WHERE id_obra = $1;  `;
       const params: any[] = [data.id_obra];
       const resultado: any[] = await this.suspensionRepositorio.query(query, params);
       return this.responseService.success(resultado, "Listado Correctamente.")
     } catch (error) {
       return this.responseService.error(error);
     }
   }




}
