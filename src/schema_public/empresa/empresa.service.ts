import { Body, Injectable, NotFoundException, Param, Patch } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Repository } from 'typeorm';
import { ApiBody } from '@nestjs/swagger';

@Injectable()
export class EmpresaService {
  
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  // Crear una nueva empresa
  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const nuevaEmpresa = this.empresaRepository.create(createEmpresaDto);
    return await this.empresaRepository.save(nuevaEmpresa);
  }

  async findAll(): Promise<Empresa[]> {
    return await this.empresaRepository
      .createQueryBuilder('empresa')
      .select('*')
      .execute();
  }

  // Obtener una empresa por ID (consulta directa con findOne)
  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository
      .createQueryBuilder('empresa')
      .select('*')
      .where('empresa.id_empresa = :id', { id })
      .execute();

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
    return empresa[0]; // Debido a que execute devuelve un array, devolvemos el primer elemento
  }

  /*async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    await this.empresaRepository.update(id, updateEmpresaDto);
    return this.empresaRepository.findOne({
      where: {id_empresa: id}
    });
  }*/
    async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
      try {
        const result = await this.empresaRepository.update(id, updateEmpresaDto);
        if (result.affected === 0) {
          throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
        }
        
        const empresaActualizada = await this.findOne(id);
        return empresaActualizada;
      } catch (error) {
        // Convertimos `error` al tipo `Error` para acceder a `message`
        throw new Error(`Error al actualizar la empresa: ${(error as Error).message}`);
      }
    }
    

  // Eliminar una empresa
  async remove(id: number): Promise<void> {
    const resultado = await this.empresaRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
  }
}
