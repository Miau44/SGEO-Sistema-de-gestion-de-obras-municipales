import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocumentoController } from './tipo_documento.controller';
import { TipoDocumentoService } from './tipo_documento.service';

describe('TipoDocumentoController', () => {
  let controller: TipoDocumentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoDocumentoController],
      providers: [TipoDocumentoService],
    }).compile();

    controller = module.get<TipoDocumentoController>(TipoDocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
