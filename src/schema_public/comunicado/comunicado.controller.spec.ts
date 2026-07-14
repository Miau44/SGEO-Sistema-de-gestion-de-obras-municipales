import { Test, TestingModule } from '@nestjs/testing';
import { ComunicadoController } from './comunicado.controller';
import { ComunicadoService } from './comunicado.service';

describe('ComunicadoController', () => {
  let controller: ComunicadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunicadoController],
      providers: [ComunicadoService],
    }).compile();

    controller = module.get<ComunicadoController>(ComunicadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
