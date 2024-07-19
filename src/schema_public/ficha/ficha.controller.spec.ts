import { Test, TestingModule } from '@nestjs/testing';
import { FichaController } from './ficha.controller';
import { FichaService } from './ficha.service';

describe('FichaController', () => {
  let controller: FichaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichaController],
      providers: [FichaService],
    }).compile();

    controller = module.get<FichaController>(FichaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
