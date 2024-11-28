import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMemorandumDto } from './dto/create-memorandum.dto';
import { UpdateMemorandumDto } from './dto/update-memorandum.dto';
import { GuardarObraDto } from './dto/obra_memo_informe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Memorandum } from './entities/memorandum.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemorandumService {
  constructor(@InjectRepository(Memorandum) private obraRepository: Repository<Memorandum>) { }

  create(createMemorandumDto: CreateMemorandumDto) {
    return 'This action adds a new memorandum';
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

  async guardarObraMemorandumInforme(data: GuardarObraDto): Promise<void> {
    try {
      const {
        idObra,
        idTipoObra,
        numeroPago,
        planillaAnticipo,
        fechaOrdenProceder,
        fechaRecepProvisional,
        plazoProvDefinitiva,
        fechaRecepDefinitiva,
        fechaInicioEjecucion,
        plazoEjecucion,
        idTipoMemo,
        idCorrelativoMemo,
        fechaMemo,
        nombreDestinatario,
        referencia,
        descripcion,
        nombreRemitente,
        cargoRemitente,
        idEstadoMemo,
        idUsuarioMemo,
        idTipoInforme,
        antecedentes,
        analisis,
        obsGeneral,
        conclusion,
        recomendacion,
        idCorrelativoInforme,
        usuarioRegistroInforme,
        idEstadoInforme,
      } = data;
  
      await this.obraRepository.query(
        `SELECT sp_guardar_obra_memorandum_informe(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )`,
        [
          idObra,
          idTipoObra,
          numeroPago,
          planillaAnticipo,
          fechaOrdenProceder,
          fechaRecepProvisional,
          plazoProvDefinitiva,
          fechaRecepDefinitiva,
          fechaInicioEjecucion,
          plazoEjecucion,
          idTipoMemo,
          idCorrelativoMemo,
          fechaMemo,
          nombreDestinatario,
          referencia,
          descripcion,
          nombreRemitente,
          cargoRemitente,
          idEstadoMemo,
          idUsuarioMemo,
          idTipoInforme,
          antecedentes,
          analisis,
          obsGeneral,
          conclusion,
          recomendacion,
          idCorrelativoInforme,
          usuarioRegistroInforme,
          idEstadoInforme,
        ],
      );
    } catch (error) {
      console.error('Error al ejecutar el procedimiento almacenado:', error);
      throw new InternalServerErrorException(
        'Error al guardar la obra, memorandum e informe',
      );
    }
  }
}
