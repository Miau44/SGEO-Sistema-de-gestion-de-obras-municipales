import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDesignacionService } from './solicitud_designacion.service';

describe('SolicitudDesignacionService', () => {
  let service: SolicitudDesignacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudDesignacionService],
    }).compile();

    service = module.get<SolicitudDesignacionService>(SolicitudDesignacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
