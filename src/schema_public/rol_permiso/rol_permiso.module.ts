import { Module } from '@nestjs/common';
import { RolPermisoService } from './rol_permiso.service';
import { RolPermisoController } from './rol_permiso.controller';

@Module({
  controllers: [RolPermisoController],
  providers: [RolPermisoService],
})
export class RolPermisoModule {}
