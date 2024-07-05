import { Injectable } from '@nestjs/common';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';

@Injectable()
export class EstructuraOrganizacionalService {
  create(createEstructuraOrganizacionalDto: CreateEstructuraOrganizacionalDto) {
    return 'This action adds a new estructuraOrganizacional';
  }

  findAll() {
    return `This action returns all estructuraOrganizacional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estructuraOrganizacional`;
  }

  update(id: number, updateEstructuraOrganizacionalDto: UpdateEstructuraOrganizacionalDto) {
    return `This action updates a #${id} estructuraOrganizacional`;
  }

  remove(id: number) {
    return `This action removes a #${id} estructuraOrganizacional`;
  }
}
