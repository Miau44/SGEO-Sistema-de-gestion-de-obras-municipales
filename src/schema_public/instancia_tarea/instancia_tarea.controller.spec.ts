import { Test, TestingModule } from '@nestjs/testing';
import { InstanciaTareaController } from './instancia_tarea.controller';
import { InstanciaTareaService } from './instancia_tarea.service';

describe('InstanciaTareaController', () => {
  let controller: InstanciaTareaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstanciaTareaController],
      providers: [InstanciaTareaService],
    }).compile();

    controller = module.get<InstanciaTareaController>(InstanciaTareaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
