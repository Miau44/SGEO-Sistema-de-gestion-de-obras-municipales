import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';

@Injectable()
export class ContratoModificatorioService {
  constructor(
    @InjectRepository(ContratoModificatorio)
    private contratoRepo: Repository<ContratoModificatorio>,
  ) {}

  findAll() {
    return this.contratoRepo.find();
  }

  findOne(id: number) {
    return this.contratoRepo.findOne({ where: { id_contrato_modificatorio: id } });
  }

  create(data: Partial<ContratoModificatorio>) {
    const contrato = this.contratoRepo.create(data);
    return this.contratoRepo.save(contrato);
  }

  async update(id: number, data: Partial<ContratoModificatorio>) {
    await this.contratoRepo.update(id, data);
    return this.contratoRepo.findOne({ where: { id_contrato_modificatorio: id } });
  }

  delete(id: number) {
    return this.contratoRepo.delete(id);
  }
}