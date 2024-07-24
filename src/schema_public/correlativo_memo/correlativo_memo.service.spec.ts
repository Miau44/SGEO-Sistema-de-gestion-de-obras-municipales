import { Test, TestingModule } from '@nestjs/testing';
import { CorrelativoMemoService } from './correlativo_memo.service';

describe('CorrelativoMemoService', () => {
  let service: CorrelativoMemoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelativoMemoService],
    }).compile();

    service = module.get<CorrelativoMemoService>(CorrelativoMemoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
