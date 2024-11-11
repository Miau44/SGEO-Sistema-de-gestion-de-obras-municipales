import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGarantiaSeguroDto } from './dto/create-garantia_seguro.dto';
import { UpdateGarantiaSeguroDto } from './dto/update-garantia_seguro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GarantiaSeguro } from './entities/garantia_seguro.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GarantiaSeguroService {
  constructor(
    @InjectRepository(GarantiaSeguro)
    private readonly garantiaSeguroRepository: Repository<GarantiaSeguro>
  ) {}

  async create(createGarantiaSeguroDto: CreateGarantiaSeguroDto): Promise<GarantiaSeguro> {
    const nuevaGarantia = this.garantiaSeguroRepository.create(createGarantiaSeguroDto);
    return await this.garantiaSeguroRepository.save(nuevaGarantia);
  }

  async findAllGarantias(): Promise<any[]> {
    return await this.garantiaSeguroRepository.query('SELECT * FROM sp_obtener_garantias()');
  }

  async findAllSeguros(): Promise<any[]> {
    return await this.garantiaSeguroRepository.query('SELECT * FROM sp_obtener_seguros()');
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

}
