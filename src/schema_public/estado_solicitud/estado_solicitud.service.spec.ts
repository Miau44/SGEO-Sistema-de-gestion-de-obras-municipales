import { Test, TestingModule } from '@nestjs/testing';
import { EstadoSolicitudService } from './estado_solicitud.service';

describe('EstadoSolicitudService', () => {
  let service: EstadoSolicitudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoSolicitudService],
    }).compile();

    service = module.get<EstadoSolicitudService>(EstadoSolicitudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
