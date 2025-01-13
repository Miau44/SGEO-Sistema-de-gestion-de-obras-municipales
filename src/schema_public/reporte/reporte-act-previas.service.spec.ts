import { Test, TestingModule } from '@nestjs/testing';
import { ReporteActPreviasService } from './reporte-act-previas.service';

describe('ReporteActPreviasService', () => {
  let service: ReporteActPreviasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteActPreviasService],
    }).compile();

    service = module.get<ReporteActPreviasService>(ReporteActPreviasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
