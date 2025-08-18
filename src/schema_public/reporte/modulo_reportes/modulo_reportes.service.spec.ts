import { Test, TestingModule } from '@nestjs/testing';
import { ModuloReportesService } from './modulo_reportes.service';

describe('ModuloReportesService', () => {
  let service: ModuloReportesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuloReportesService],
    }).compile();

    service = module.get<ModuloReportesService>(ModuloReportesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
