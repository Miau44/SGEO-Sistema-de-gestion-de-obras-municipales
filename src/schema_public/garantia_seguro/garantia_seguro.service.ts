import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGarantiaSeguroDto } from './dto/create-garantia_seguro.dto';
import { UpdateGarantiaSeguroDto } from './dto/update-garantia_seguro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GarantiaSeguro } from './entities/garantia_seguro.entity';
import { Repository } from 'typeorm';
import { ResponseService } from 'src/response.service';
import { ObraGarantiaDto } from './dto/obra.dto';

@Injectable()
export class GarantiaSeguroService {
  constructor(
    @InjectRepository(GarantiaSeguro)
    private readonly garantiaSeguroRepository: Repository<GarantiaSeguro>,
    private responseService: ResponseService
  ) {}

  async create(createGarantiaSeguroDto: CreateGarantiaSeguroDto): Promise<void> {
    const {
        id_obra,
        tipo_accion,
        id_tipo_documento,
        id_entidad_emisora,
        inicio_vigencia,
        fin_vigencia,
        monto,
        id_estado,
        id_usuario,
        id_tipo_garantia,
        id_tipo_seguro,  // Añadido para manejar seguros
        id_documento
    } = createGarantiaSeguroDto;

    await this.garantiaSeguroRepository.query(
        `SELECT public.sp_crear_garantia_seguro(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )`,
        [
            id_obra,
            tipo_accion,
            id_tipo_documento,
            id_entidad_emisora,
            inicio_vigencia,
            fin_vigencia,
            monto,
            id_estado,
            id_usuario,
            tipo_accion === 'garantia' ? id_tipo_garantia : null, // Enviar id_tipo_garantia solo si es garantía
            tipo_accion === 'seguro' ? id_tipo_seguro : null,     // Enviar id_tipo_seguro solo si es seguro
            id_documento
        ]
    );
  }



async findAllGarantias(id_obra: number): Promise<any[]> {
  return await this.garantiaSeguroRepository.query('SELECT * FROM sp_obtener_garantias($1)', [id_obra]);
}

async findAllSeguros(id_obra: number): Promise<any[]> {
    return await this.garantiaSeguroRepository.query('SELECT * FROM sp_obtener_seguros($1)', [id_obra]);
}


  async listarSubtiposPorTipo(descTipo: string): Promise<{ id: number; desc_subtipo: string }[]> {
    const query = ` SELECT * FROM listar_subtipos_por_tipo($1);`;
    const result = await this.garantiaSeguroRepository.query(query, [descTipo]);
    return result;
  }

  async findOne(id: number): Promise<GarantiaSeguro> {
    const garantia = await this.garantiaSeguroRepository.findOne({
      where: { id_garantia_seguro: id },
      relations: ['obras', 'documento', 'tipoDocumen', 'estado'],
    });
    if (!garantia) {
      throw new NotFoundException(`Garantía de seguro con ID ${id} no encontrada`);
    }
    return garantia;
  }

  async update(id: number, updateGarantiaSeguroDto: UpdateGarantiaSeguroDto): Promise<GarantiaSeguro> {
    await this.garantiaSeguroRepository.update(id, updateGarantiaSeguroDto);
    const garantiaActualizada = await this.findOne(id);
    return garantiaActualizada;
  }

  async remove(id: number): Promise<void> {
    const result = await this.garantiaSeguroRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Garantía de seguro con ID ${id} no encontrada`);
    }
  }


  async listaTipoGarantia(data: ObraGarantiaDto) {
    try {
  
      const query = `SELECT idsubtipo AS id_subtipo, descsubtipo AS desc_subtipo FROM  public.sp_lista_tipo_garantia($1)`;
  
      const values =[data.obra]
      const resultado = await this.garantiaSeguroRepository.query(query, values);
      return this.responseService.success(resultado, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  
  

}
