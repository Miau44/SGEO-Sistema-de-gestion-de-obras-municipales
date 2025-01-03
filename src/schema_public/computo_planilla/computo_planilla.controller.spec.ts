import { Test, TestingModule } from '@nestjs/testing';
import { ComputoPlanillaController } from './computo_planilla.controller';
import { ComputoPlanillaService } from './computo_planilla.service';

describe('ComputoPlanillaController', () => {
  let controller: ComputoPlanillaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComputoPlanillaController],
      providers: [ComputoPlanillaService],
    }).compile();

    controller = module.get<ComputoPlanillaController>(ComputoPlanillaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
