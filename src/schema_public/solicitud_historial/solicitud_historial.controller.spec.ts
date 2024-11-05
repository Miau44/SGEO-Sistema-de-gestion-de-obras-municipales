import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudHistorialController } from './solicitud_historial.controller';
import { SolicitudHistorialService } from './solicitud_historial.service';

describe('SolicitudHistorialController', () => {
  let controller: SolicitudHistorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudHistorialController],
      providers: [SolicitudHistorialService],
    }).compile();

    controller = module.get<SolicitudHistorialController>(SolicitudHistorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
