import { Test, TestingModule } from '@nestjs/testing';
import { ComputoController } from './computo.controller';
import { ComputoService } from './computo.service';

describe('ComputoController', () => {
  let controller: ComputoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComputoController],
      providers: [ComputoService],
    }).compile();

    controller = module.get<ComputoController>(ComputoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
