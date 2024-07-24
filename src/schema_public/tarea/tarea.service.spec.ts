import { Test, TestingModule } from '@nestjs/testing';
import { TareaService } from './tarea.service';

describe('TareaService', () => {
  let service: TareaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TareaService],
    }).compile();

    service = module.get<TareaService>(TareaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
