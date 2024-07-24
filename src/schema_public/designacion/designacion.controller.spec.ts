import { Test, TestingModule } from '@nestjs/testing';
import { DesignacionController } from './designacion.controller';
import { DesignacionService } from './designacion.service';

describe('DesignacionController', () => {
  let controller: DesignacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignacionController],
      providers: [DesignacionService],
    }).compile();

    controller = module.get<DesignacionController>(DesignacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
