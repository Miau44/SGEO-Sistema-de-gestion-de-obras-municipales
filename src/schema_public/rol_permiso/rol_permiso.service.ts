import { Injectable } from '@nestjs/common';
import { CreateRolPermisoDto } from './dto/create-rol_permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol_permiso.dto';

@Injectable()
export class RolPermisoService {
  create(createRolPermisoDto: CreateRolPermisoDto) {
    return 'This action adds a new rolPermiso';
  }

  findAll() {
    return `This action returns all rolPermiso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolPermiso`;
  }

  update(id: number, updateRolPermisoDto: UpdateRolPermisoDto) {
    return `This action updates a #${id} rolPermiso`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolPermiso`;
  }
}
