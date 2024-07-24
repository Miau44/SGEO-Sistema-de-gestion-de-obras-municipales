import { Test, TestingModule } from '@nestjs/testing';
import { InstanciaTareaService } from './instancia_tarea.service';

describe('InstanciaTareaService', () => {
  let service: InstanciaTareaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstanciaTareaService],
    }).compile();

    service = module.get<InstanciaTareaService>(InstanciaTareaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
