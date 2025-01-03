import { Test, TestingModule } from '@nestjs/testing';
import { ComputoPlanillaService } from './computo_planilla.service';

describe('ComputoPlanillaService', () => {
  let service: ComputoPlanillaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComputoPlanillaService],
    }).compile();

    service = module.get<ComputoPlanillaService>(ComputoPlanillaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
