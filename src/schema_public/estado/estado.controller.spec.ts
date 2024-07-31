import { Test, TestingModule } from '@nestjs/testing';
import { EstadoController } from './estado.controller';
import { EstadoService } from './estado.service';

describe('EstadoController', () => {
  let controller: EstadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoController],
      providers: [EstadoService],
    }).compile();

    controller = module.get<EstadoController>(EstadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
