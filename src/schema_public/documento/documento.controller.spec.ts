import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';

describe('DocumentoController', () => {
  let controller: DocumentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoController],
      providers: [DocumentoService],
    }).compile();

    controller = module.get<DocumentoController>(DocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
