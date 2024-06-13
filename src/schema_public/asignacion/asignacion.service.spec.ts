import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionService } from './asignacion.service';

describe('AsignacionService', () => {
  let service: AsignacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignacionService],
    }).compile();

    service = module.get<AsignacionService>(AsignacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
