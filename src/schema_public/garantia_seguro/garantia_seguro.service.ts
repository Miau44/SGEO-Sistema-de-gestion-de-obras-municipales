import { Injectable } from '@nestjs/common';
import { CreateGarantiaSeguroDto } from './dto/create-garantia_seguro.dto';
import { UpdateGarantiaSeguroDto } from './dto/update-garantia_seguro.dto';

@Injectable()
export class GarantiaSeguroService {
  create(createGarantiaSeguroDto: CreateGarantiaSeguroDto) {
    return 'This action adds a new garantiaSeguro';
  }

  findAll() {
    return `This action returns all garantiaSeguro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} garantiaSeguro`;
  }

  update(id: number, updateGarantiaSeguroDto: UpdateGarantiaSeguroDto) {
    return `This action updates a #${id} garantiaSeguro`;
  }

  remove(id: number) {
    return `This action removes a #${id} garantiaSeguro`;
  }
}
