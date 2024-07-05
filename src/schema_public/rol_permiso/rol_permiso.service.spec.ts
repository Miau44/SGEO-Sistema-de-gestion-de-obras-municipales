import { Test, TestingModule } from '@nestjs/testing';
import { RolPermisoService } from './rol_permiso.service';

describe('RolPermisoService', () => {
  let service: RolPermisoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolPermisoService],
    }).compile();

    service = module.get<RolPermisoService>(RolPermisoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
