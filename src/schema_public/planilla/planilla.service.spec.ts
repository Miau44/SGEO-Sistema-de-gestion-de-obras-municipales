import { Test, TestingModule } from '@nestjs/testing';
import { PlanillaService } from './planilla.service';

describe('PlanillaService', () => {
  let service: PlanillaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanillaService],
    }).compile();

    service = module.get<PlanillaService>(PlanillaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
