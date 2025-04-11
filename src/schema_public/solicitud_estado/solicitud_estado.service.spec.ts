import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudEstadoService } from './solicitud_estado.service';

describe('SolicitudEstadoService', () => {
  let service: SolicitudEstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudEstadoService],
    }).compile();

    service = module.get<SolicitudEstadoService>(SolicitudEstadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
