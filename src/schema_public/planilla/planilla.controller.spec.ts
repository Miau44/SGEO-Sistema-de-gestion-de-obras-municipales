import { Test, TestingModule } from '@nestjs/testing';
import { PlanillaController } from './planilla.controller';
import { PlanillaService } from './planilla.service';

describe('PlanillaController', () => {
  let controller: PlanillaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanillaController],
      providers: [PlanillaService],
    }).compile();

    controller = module.get<PlanillaController>(PlanillaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
