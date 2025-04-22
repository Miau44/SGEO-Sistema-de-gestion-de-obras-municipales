import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMemorandumDto } from './dto/create-memorandum.dto';
import { UpdateMemorandumDto } from './dto/update-memorandum.dto';
import { GuardarObraDto } from './dto/obra_memo_informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { CreateInformeDto } from '../informe/dto/create-informe.dto';
import { Obra } from '../obra/entities/obra.entity';
import { Informe } from '../informe/entities/informe.entity';
import {CorrelativoService} from '../correlativo/correlativo.service';
import { Contrato } from '../contrato-modificatorio/entities/contrato.entity';
@Injectable()
export class MemorandumService {

  constructor(
    @InjectRepository(Memorandum) private memoRepository: Repository<Memorandum>,
    @InjectRepository(Obra) private obraRepository: Repository<Obra>,
    @InjectRepository(Informe) private informeRepository: Repository<Informe>,
    @InjectRepository(Contrato) private contratoRepository: Repository<Contrato>,

    private responseService: ResponseService,
    private readonly correlativoService: CorrelativoService,
  ) { }


  async create(createMemorandumDto: CreateMemorandumDto) {
    try {
      const resultado = await this.memoRepository.save(createMemorandumDto);
      return this.responseService.success(resultado, "GUardado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  findAll() {
    return `This action returns all memorandum`;
  }

  findOne(id: number) {
    return `This action returns a #${id} memorandum`;
  }

  update(id: number, updateMemorandumDto: UpdateMemorandumDto) {
    return `This action updates a #${id} memorandum`;
  }

  remove(id: number) {
    return `This action removes a #${id} memorandum`;
  }

  async guardarObraMemorandumInforme(updateObraMemInfDto: GuardarObraDto) {
    try {
      const data_obra = {
        "id_obra": updateObraMemInfDto.idObra,
        "id_tipo_pago": updateObraMemInfDto.idTipoPago,
        "numero_pago": updateObraMemInfDto.numeroPago,
        "planilla_anticipo": updateObraMemInfDto.planillaAnticipo,
        "fecha_orden_proceder": updateObraMemInfDto.fechaOrdenProceder,
        "fecha_recep_provisional": updateObraMemInfDto.fechaRecepProvisional,
        "plazo_prov_definitiva": updateObraMemInfDto.plazoProvDefinitiva,
        "fecha_recep_definitiva": updateObraMemInfDto.fechaRecepDefinitiva,
        "fecha_inicio_ejecucion": updateObraMemInfDto.fechaInicioEjecucion,
        "plazo_ejecucion": updateObraMemInfDto.plazoEjecucion,
      };
      await this.obraRepository.update(updateObraMemInfDto.idObra, data_obra);

      console.log('➡️ Enviando a correlativoService.create (MEMO):', {
        id_obra: updateObraMemInfDto.idObra,
        id_tipo_documento: 241,
        correlativo: '',
        usuario_registro: updateObraMemInfDto.idUsuarioMemo,
        id_estado: 1
      });
      // 2. Crear correlativo para MEMORANDUM
    const correlativoMemoRes = await this.correlativoService.create( {
      
      id_obra: updateObraMemInfDto.idObra,
      id_tipo_documento: 241,
      correlativo: '', 
      usuario_registro: updateObraMemInfDto.idUsuarioMemo,
      id_estado : 1
    });
    console.log('⬅️ Respuesta de correlativoService.create:', correlativoMemoRes);

    if (correlativoMemoRes.statusCode !== 200) {
      throw new Error('Error al generar correlativo del memorandum');
    }

    const idCorrelativoMemo = correlativoMemoRes.data.id_correlativo;

      const data_memo = {
        "id_obra": updateObraMemInfDto.idObra,
        "id_tipo_memo":241,
        "id_correlativo": idCorrelativoMemo,
        "fecha_memo": "2024-11-29T19:57:41.028Z",
        "nombre_destinatario": updateObraMemInfDto.nombreDestinatario,
        "referencia": updateObraMemInfDto.referencia,
        "descripcion": updateObraMemInfDto.descripcion,
        "nombre_remitente": "",
        "cargo_remitente": updateObraMemInfDto.cargoRemitente,
        "id_usuario": updateObraMemInfDto.idUsuarioMemo,
      };
      await this.memoRepository.save(data_memo);

      // 🟡 Log previo al correlativo (INFORME)
    console.log('➡️ Enviando a correlativoService.create (INFORME):', {
      id_obra: updateObraMemInfDto.idObra,
      id_tipo_documento: 223,
      correlativo: '',
      usuario_registro: updateObraMemInfDto.usuarioRegistroInforme,
      id_estado: 1
    });

      const correlativoInformeRes = await this.correlativoService.create({
        id_obra: updateObraMemInfDto.idObra,
        id_tipo_documento: 223, 
        correlativo: '', 
        usuario_registro: updateObraMemInfDto.usuarioRegistroInforme,
        id_estado : 1
      });
  
      if (correlativoMemoRes.statusCode !== 200) {
        throw new Error('Error al generar correlativo del informe');
      }
  
      const idCorrelativoInforme = correlativoInformeRes.data.id_correlativo;

      const data_infor = {
        "id_obra": updateObraMemInfDto.idObra,
        "id_tipo_informe": 223,
        "antecedentes": "",
        "analisis": updateObraMemInfDto.analisis,
        "obs_general": "",
        "conclusion": updateObraMemInfDto.conclusion,
        "recomendacion": updateObraMemInfDto.recomendacion,
        "id_correlativo": idCorrelativoInforme,
        "usuario_registro": updateObraMemInfDto.usuarioRegistroInforme,
      };
     const result =  await this.informeRepository.save(data_infor);

      return this.responseService.success(result, "Guardado Correctamente.");
    } catch (error) {
      return this.responseService.error(error, "Error al guardar los datos.");
    }
  }

  async obtenerObraMemoInforme(id_obra: number) {
    try {
      const obra = await this.obraRepository.findOne({ where: { id_obra } });
      const memo = await this.memoRepository.findOne({ where: { id_obra } });
      const informe = await this.informeRepository.findOne({ where: { id_obra } });
      const contrato = await this.contratoRepository.findOne({ where: { id_obra } });
      const plazo_contrato = contrato?.plazo_contrato ?? null;
      
      const plazo_conObra = obra ? { ...obra, plazo_contrato } : null;

      return this.responseService.success({ obra:plazo_conObra, memo, informe }, 'Datos encontrados correctamente.');
    } catch (error) {
      return this.responseService.error(error, 'Error al obtener datos.');
    }
  }
}
