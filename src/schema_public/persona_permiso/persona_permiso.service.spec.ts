import { Test, TestingModule } from '@nestjs/testing';
import { PersonaPermisoService } from './persona_permiso.service';

describe('PersonaPermisoService', () => {
  let service: PersonaPermisoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonaPermisoService],
    }).compile();

    service = module.get<PersonaPermisoService>(PersonaPermisoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
