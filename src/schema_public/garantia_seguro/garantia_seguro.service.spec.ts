import { Test, TestingModule } from '@nestjs/testing';
import { GarantiaSeguroService } from './garantia_seguro.service';

describe('GarantiaSeguroService', () => {
  let service: GarantiaSeguroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GarantiaSeguroService],
    }).compile();

    service = module.get<GarantiaSeguroService>(GarantiaSeguroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
