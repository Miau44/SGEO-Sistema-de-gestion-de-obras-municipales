import { Test, TestingModule } from '@nestjs/testing';
import { FichaService } from './ficha.service';

describe('FichaService', () => {
  let service: FichaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FichaService],
    }).compile();

    service = module.get<FichaService>(FichaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
