import { Module } from '@nestjs/common';
import { RolPermisoService } from './rol_permiso.service';
import { RolPermisoController } from './rol_permiso.controller';
import { ResponseService } from 'src/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolPermiso } from './entities/rol_permiso.entity';


@Module({

  imports: [ 
  TypeOrmModule.forFeature([RolPermiso])],

  controllers: [RolPermisoController],
  providers: [RolPermisoService],
})
export class RolPermisoModule {}
