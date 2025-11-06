import { Test, TestingModule } from '@nestjs/testing';
import { ArchivoActaService } from './archivo_acta.service';

describe('ArchivoActaService', () => {
  let service: ArchivoActaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchivoActaService],
    }).compile();

    service = module.get<ArchivoActaService>(ArchivoActaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
