import { Test, TestingModule } from '@nestjs/testing';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';

describe('ReporteOrdenProcederService', () => {
  let service: ReporteOrdenProcederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteOrdenProcederService],
    }).compile();

    service = module.get<ReporteOrdenProcederService>(ReporteOrdenProcederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
