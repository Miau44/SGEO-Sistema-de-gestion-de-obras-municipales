import { Test, TestingModule } from '@nestjs/testing';
import { InformeInicialService } from './informe_inicial.service';

describe('InformeInicialService', () => {
  let service: InformeInicialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformeInicialService],
    }).compile();

    service = module.get<InformeInicialService>(InformeInicialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
