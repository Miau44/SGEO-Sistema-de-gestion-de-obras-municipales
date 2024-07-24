import { Test, TestingModule } from '@nestjs/testing';
import { CorrelativoMemoController } from './correlativo_memo.controller';
import { CorrelativoMemoService } from './correlativo_memo.service';

describe('CorrelativoMemoController', () => {
  let controller: CorrelativoMemoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorrelativoMemoController],
      providers: [CorrelativoMemoService],
    }).compile();

    controller = module.get<CorrelativoMemoController>(CorrelativoMemoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
