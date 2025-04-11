import { Test, TestingModule } from '@nestjs/testing';
import { ComputoService } from './computo.service';

describe('ComputoPlanillaService', () => {
  let service: ComputoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComputoService],
    }).compile();

    service = module.get<ComputoService>(ComputoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
