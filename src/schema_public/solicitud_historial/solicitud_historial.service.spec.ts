import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudHistorialService } from './solicitud_historial.service';

describe('SolicitudHistorialService', () => {
  let service: SolicitudHistorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudHistorialService],
    }).compile();

    service = module.get<SolicitudHistorialService>(SolicitudHistorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
