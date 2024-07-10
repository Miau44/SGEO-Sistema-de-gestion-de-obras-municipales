import { Test, TestingModule } from '@nestjs/testing';
import { ExternoService } from './externo.service';

describe('ExternoService', () => {
  let service: ExternoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternoService],
    }).compile();

    service = module.get<ExternoService>(ExternoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
