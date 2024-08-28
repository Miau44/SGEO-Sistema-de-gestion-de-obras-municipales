import { Test, TestingModule } from '@nestjs/testing';
import { TipoInformeController } from './tipo_informe.controller';
import { TipoInformeService } from './tipo_informe.service';

describe('TipoInformeController', () => {
  let controller: TipoInformeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoInformeController],
      providers: [TipoInformeService],
    }).compile();

    controller = module.get<TipoInformeController>(TipoInformeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
