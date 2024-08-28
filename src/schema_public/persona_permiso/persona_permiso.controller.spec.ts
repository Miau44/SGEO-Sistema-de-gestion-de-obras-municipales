import { Test, TestingModule } from '@nestjs/testing';
import { PersonaPermisoController } from './persona_permiso.controller';
import { PersonaPermisoService } from './persona_permiso.service';

describe('PersonaPermisoController', () => {
  let controller: PersonaPermisoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonaPermisoController],
      providers: [PersonaPermisoService],
    }).compile();

    controller = module.get<PersonaPermisoController>(PersonaPermisoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
