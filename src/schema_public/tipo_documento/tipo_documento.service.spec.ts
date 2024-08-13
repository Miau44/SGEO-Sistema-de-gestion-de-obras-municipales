import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocumentoService } from './tipo_documento.service';

describe('TipoDocumentoService', () => {
  let service: TipoDocumentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoDocumentoService],
    }).compile();

    service = module.get<TipoDocumentoService>(TipoDocumentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
