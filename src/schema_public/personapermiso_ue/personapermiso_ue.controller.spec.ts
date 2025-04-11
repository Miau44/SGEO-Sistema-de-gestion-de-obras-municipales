import { Test, TestingModule } from '@nestjs/testing';
import { PersonapermisoUeController } from './personapermiso_ue.controller';
import { PersonapermisoUeService } from './personapermiso_ue.service';

describe('PersonapermisoUeController', () => {
  let controller: PersonapermisoUeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonapermisoUeController],
      providers: [PersonapermisoUeService],
    }).compile();

    controller = module.get<PersonapermisoUeController>(PersonapermisoUeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
