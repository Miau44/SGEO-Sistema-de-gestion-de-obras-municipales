import { Test, TestingModule } from '@nestjs/testing';
import { ParametricaService } from './parametrica.service';

describe('ParametricaService', () => {
  let service: ParametricaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParametricaService],
    }).compile();

    service = module.get<ParametricaService>(ParametricaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
