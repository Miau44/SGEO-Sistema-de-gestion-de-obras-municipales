import { Test, TestingModule } from '@nestjs/testing';
import { ReporteService } from './reporte.service';

describe('ReporteService', () => {
  let service: ReporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteService],
    }).compile();

    service = module.get<ReporteService>(ReporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
