import { Test, TestingModule } from '@nestjs/testing';
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';

describe('ReporteController', () => {
  let controller: ReporteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReporteController],
      providers: [ReporteService],
    }).compile();

    controller = module.get<ReporteController>(ReporteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
