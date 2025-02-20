import { Test, TestingModule } from '@nestjs/testing';
import { ModificacionPagoController } from './modificacion_pago.controller';
import { ModificacionPagoService } from './modificacion_pago.service';

describe('ModificacionPagoController', () => {
  let controller: ModificacionPagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModificacionPagoController],
      providers: [ModificacionPagoService],
    }).compile();

    controller = module.get<ModificacionPagoController>(ModificacionPagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
