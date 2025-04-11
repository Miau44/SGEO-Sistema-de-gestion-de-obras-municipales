import { Injectable } from '@nestjs/common';
import { CreateRolPermisoDto } from './dto/create-rol_permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol_permiso.dto';
import { RolPermiso } from './entities/rol_permiso.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermisoDto } from './dto/permisos,dto';


@Injectable()
export class RolPermisoService {
  constructor(@InjectRepository(RolPermiso) private rolPermisoRepo: Repository<RolPermiso>) { }
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
  async conpermisito(permisoDto: PermisoDto) {
    const consultaSql = 'SELECT * FROM public.sp_verpermisos($1, $2)';
    const values = [permisoDto.rol, permisoDto.usuario];
    const result = await this.rolPermisoRepo.query(consultaSql, values);
    return {
      mensaje: 'Permisos',
      estado: true,
      data: result
    };
  }
  //SELECT public.sp_cotejarroles('JEFE SOLICITANTE')
  async cotejarol(v_rol: string) {
    const consultaSql = 'SELECT * FROM public.sp_cotejarroles($1)';
    const values = [v_rol];
    const result = await this.rolPermisoRepo.query(consultaSql, values);
    return result;
  }



}
