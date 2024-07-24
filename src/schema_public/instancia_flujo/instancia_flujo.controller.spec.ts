import { Test, TestingModule } from '@nestjs/testing';
import { InstanciaFlujoController } from './instancia_flujo.controller';
import { InstanciaFlujoService } from './instancia_flujo.service';

describe('InstanciaFlujoController', () => {
  let controller: InstanciaFlujoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstanciaFlujoController],
      providers: [InstanciaFlujoService],
    }).compile();

    controller = module.get<InstanciaFlujoController>(InstanciaFlujoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
