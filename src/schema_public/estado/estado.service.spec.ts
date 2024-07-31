import { Test, TestingModule } from '@nestjs/testing';
import { EstadoService } from './estado.service';

describe('EstadoService', () => {
  let service: EstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoService],
    }).compile();

    service = module.get<EstadoService>(EstadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
