import { Test, TestingModule } from '@nestjs/testing';
import { ComunicadoService } from './comunicado.service';

describe('ComunicadoService', () => {
  let service: ComunicadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComunicadoService],
    }).compile();

    service = module.get<ComunicadoService>(ComunicadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
