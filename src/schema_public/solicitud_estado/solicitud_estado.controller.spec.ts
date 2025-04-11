import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudEstadoController } from './solicitud_estado.controller';
import { SolicitudEstadoService } from './solicitud_estado.service';

describe('SolicitudEstadoController', () => {
  let controller: SolicitudEstadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudEstadoController],
      providers: [SolicitudEstadoService],
    }).compile();

    controller = module.get<SolicitudEstadoController>(SolicitudEstadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
