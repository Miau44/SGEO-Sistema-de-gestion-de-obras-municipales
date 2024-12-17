import { Test, TestingModule } from '@nestjs/testing';
import { CorrelativoService } from './correlativo.service';

describe('CorrelativoService', () => {
  let service: CorrelativoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelativoService],
    }).compile();

    service = module.get<CorrelativoService>(CorrelativoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
