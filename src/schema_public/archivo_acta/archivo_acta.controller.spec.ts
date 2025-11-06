import { Test, TestingModule } from '@nestjs/testing';
import { ArchivoActaController } from './archivo_acta.controller';
import { ArchivoActaService } from './archivo_acta.service';

describe('ArchivoActaController', () => {
  let controller: ArchivoActaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivoActaController],
      providers: [ArchivoActaService],
    }).compile();

    controller = module.get<ArchivoActaController>(ArchivoActaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
