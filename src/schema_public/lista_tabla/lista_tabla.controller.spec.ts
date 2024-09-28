import { Test, TestingModule } from '@nestjs/testing';
import { ListaTablaController } from './lista_tabla.controller';

describe('ListaTablaController', () => {
  let controller: ListaTablaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListaTablaController],
    }).compile();

    controller = module.get<ListaTablaController>(ListaTablaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
