import { Test, TestingModule } from '@nestjs/testing';
import { ReporteModificacionService } from './reporte-modificacion/reporte-modificacion.service';

describe('ReporteModificacionService', () => {
  let service: ReporteModificacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteModificacionService],
    }).compile();

    service = module.get<ReporteModificacionService>(ReporteModificacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
