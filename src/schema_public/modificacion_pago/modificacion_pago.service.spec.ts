import { Test, TestingModule } from '@nestjs/testing';
import { ModificacionPagoService } from './modificacion_pago.service';

describe('ModificacionPagoService', () => {
  let service: ModificacionPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModificacionPagoService],
    }).compile();

    service = module.get<ModificacionPagoService>(ModificacionPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
