import { Test, TestingModule } from '@nestjs/testing';
import { RolPermisoController } from './rol_permiso.controller';
import { RolPermisoService } from './rol_permiso.service';

describe('RolPermisoController', () => {
  let controller: RolPermisoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolPermisoController],
      providers: [RolPermisoService],
    }).compile();

    controller = module.get<RolPermisoController>(RolPermisoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
