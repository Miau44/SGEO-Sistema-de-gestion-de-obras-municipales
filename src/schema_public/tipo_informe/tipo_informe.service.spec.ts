import { Test, TestingModule } from '@nestjs/testing';
import { TipoInformeService } from './tipo_informe.service';

describe('TipoInformeService', () => {
  let service: TipoInformeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoInformeService],
    }).compile();

    service = module.get<TipoInformeService>(TipoInformeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
