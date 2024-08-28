import { Test, TestingModule } from '@nestjs/testing';
import { PersonapermisoUeService } from './personapermiso_ue.service';

describe('PersonapermisoUeService', () => {
  let service: PersonapermisoUeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonapermisoUeService],
    }).compile();

    service = module.get<PersonapermisoUeService>(PersonapermisoUeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
