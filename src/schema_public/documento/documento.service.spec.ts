import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoService } from './documento.service';

describe('DocumentoService', () => {
  let service: DocumentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoService],
    }).compile();

    service = module.get<DocumentoService>(DocumentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
