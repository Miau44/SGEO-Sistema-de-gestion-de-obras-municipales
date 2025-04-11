import { Test, TestingModule } from '@nestjs/testing';
import { EstadoSolicitudController } from './estado_solicitud.controller';
import { EstadoSolicitudService } from './estado_solicitud.service';

describe('EstadoSolicitudController', () => {
  let controller: EstadoSolicitudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoSolicitudController],
      providers: [EstadoSolicitudService],
    }).compile();

    controller = module.get<EstadoSolicitudController>(EstadoSolicitudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
