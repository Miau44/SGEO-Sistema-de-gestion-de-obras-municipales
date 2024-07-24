import { Test, TestingModule } from '@nestjs/testing';
import { InstanciaFlujoService } from './instancia_flujo.service';

describe('InstanciaFlujoService', () => {
  let service: InstanciaFlujoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstanciaFlujoService],
    }).compile();

    service = module.get<InstanciaFlujoService>(InstanciaFlujoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
