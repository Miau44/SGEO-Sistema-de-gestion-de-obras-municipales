import { Test, TestingModule } from '@nestjs/testing';
import { ParametricaController } from './parametrica.controller';
import { ParametricaService } from './parametrica.service';

describe('ParametricaController', () => {
  let controller: ParametricaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParametricaController],
      providers: [ParametricaService],
    }).compile();

    controller = module.get<ParametricaController>(ParametricaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
