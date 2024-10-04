import { Test, TestingModule } from '@nestjs/testing';
import { ListaParametricaController } from './lista_parametrica.controller';

describe('ListaController', () => {
  let controller: ListaParametricaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListaParametricaController],
    }).compile();

    controller = module.get<ListaParametricaController>(ListaParametricaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
