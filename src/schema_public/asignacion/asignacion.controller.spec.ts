import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionController } from './asignacion.controller';
import { AsignacionService } from './asignacion.service';

describe('AsignacionController', () => {
  let controller: AsignacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignacionController],
      providers: [AsignacionService],
    }).compile();

    controller = module.get<AsignacionController>(AsignacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
