import { Test, TestingModule } from '@nestjs/testing';
import { ListaParametricaService } from './lista_parametrica.service';

describe('ListaParametricaService', () => {
  let service: ListaParametricaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListaParametricaService],
    }).compile();

    service = module.get<ListaParametricaService>(ListaParametricaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
