import { Test, TestingModule } from '@nestjs/testing';
import { ListaTablaService } from './lista_tabla.service';

describe('ListaTablaService', () => {
  let service: ListaTablaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListaTablaService],
    }).compile();

    service = module.get<ListaTablaService>(ListaTablaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
