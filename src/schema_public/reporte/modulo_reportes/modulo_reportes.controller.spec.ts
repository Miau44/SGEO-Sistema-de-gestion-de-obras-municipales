import { Test, TestingModule } from '@nestjs/testing';
import { ModuloReportesController } from './modulo_reportes.controller';
import { ModuloReportesService } from './modulo_reportes.service';

describe('ModuloReportesController', () => {
  let controller: ModuloReportesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuloReportesController],
      providers: [ModuloReportesService],
    }).compile();

    controller = module.get<ModuloReportesController>(ModuloReportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
