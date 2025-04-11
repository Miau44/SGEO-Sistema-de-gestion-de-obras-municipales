import { Test, TestingModule } from '@nestjs/testing';
import { EstadoGeneralService } from './estado_general.service';

describe('EstadoGeneralService', () => {
  let service: EstadoGeneralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoGeneralService],
    }).compile();

    service = module.get<EstadoGeneralService>(EstadoGeneralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
