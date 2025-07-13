import { Test, TestingModule } from '@nestjs/testing';
import { PagoController } from './pago.controller';
import { PagoService } from './pago.service';

describe('PagoController', () => {
  let controller: PagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagoController],
      providers: [PagoService],
    }).compile();

    controller = module.get<PagoController>(PagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
