import { Test, TestingModule } from '@nestjs/testing';
import { GarantiaSeguroController } from './garantia_seguro.controller';
import { GarantiaSeguroService } from './garantia_seguro.service';

describe('GarantiaSeguroController', () => {
  let controller: GarantiaSeguroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarantiaSeguroController],
      providers: [GarantiaSeguroService],
    }).compile();

    controller = module.get<GarantiaSeguroController>(GarantiaSeguroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
