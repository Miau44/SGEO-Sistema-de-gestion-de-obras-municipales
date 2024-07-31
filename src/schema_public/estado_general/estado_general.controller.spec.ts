import { Test, TestingModule } from '@nestjs/testing';
import { EstadoGeneralController } from './estado_general.controller';
import { EstadoGeneralService } from './estado_general.service';

describe('EstadoGeneralController', () => {
  let controller: EstadoGeneralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoGeneralController],
      providers: [EstadoGeneralService],
    }).compile();

    controller = module.get<EstadoGeneralController>(EstadoGeneralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
