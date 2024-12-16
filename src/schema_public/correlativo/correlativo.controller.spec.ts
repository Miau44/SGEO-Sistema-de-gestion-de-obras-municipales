import { Test, TestingModule } from '@nestjs/testing';
import { CorrelativoController } from './correlativo.controller';
import { CorrelativoService } from './correlativo.service';

describe('CorrelativoController', () => {
  let controller: CorrelativoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorrelativoController],
      providers: [CorrelativoService],
    }).compile();

    controller = module.get<CorrelativoController>(CorrelativoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
