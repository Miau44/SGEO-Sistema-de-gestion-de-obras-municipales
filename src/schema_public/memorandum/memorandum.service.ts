import { Injectable } from '@nestjs/common';
import { CreateMemorandumDto } from './dto/create-memorandum.dto';
import { UpdateMemorandumDto } from './dto/update-memorandum.dto';
import { GuardarObraDto } from './dto/obra_memo_informe.dto';

@Injectable()
export class MemorandumService {

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
/*
  async guardarObraMemorandumInforme(
    idObra: number,
    idTipoObra: number,
    numeroPagos: number,
    planillasAnticipo: number,
    fechaOrdenProceder: string,
    fechaRecepProvisional: string,
    plazoProvDefinitiva: number,
    fechaRecepDefinitiva: string,
    fechaInicio: string,
    plazoEjecucion: number,
    idTipoMemo: number,
    idCorrelativoMemo: number,
    fechaMemo: string,
    nombreDestinatario: string,
    referencia: string,
    descripcion: string,
    nombreRemitente: string,
    cargoRemitente: string,
    idEstadoMemo: number,
    idUsuarioMemo: number,
    idTipoInforme: number,
    antecedentes: string,
    analisis: string,
    obsGeneral: string,
    conclusion: string,
    recomendacion: string,
    idCorrelativoInforme: number,
    usuarioRegistro: number,
    idEstadoInforme: number,
  ): Promise<void> {
    try {
      // Ejecutar el procedimiento almacenado
      await this.createObraMemoInformeDto.query(
        `SELECT sp_guardar_obra_memorandum_informe(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
          $21, $22, $23, $24, $25, $26, $27, $28, $29
        )`,
        [
          idObra,
          idTipoObra,
          numeroPagos,
          planillasAnticipo,
          fechaOrdenProceder,
          fechaRecepProvisional,
          plazoProvDefinitiva,
          fechaRecepDefinitiva,
          fechaInicio,
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
          usuarioRegistro,
          idEstadoInforme,
        ],
      );
    } catch (error) {
      console.error('Error ejecutando SP:', error);
      throw new Error('Error al guardar los datos');
    }
  }*/
}
