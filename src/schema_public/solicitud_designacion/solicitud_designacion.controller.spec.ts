import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudDesignacionController } from './solicitud_designacion.controller';
import { SolicitudDesignacionService } from './solicitud_designacion.service';

describe('SolicitudDesignacionController', () => {
  let controller: SolicitudDesignacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudDesignacionController],
      providers: [SolicitudDesignacionService],
    }).compile();

    controller = module.get<SolicitudDesignacionController>(SolicitudDesignacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
