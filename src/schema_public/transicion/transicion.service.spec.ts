import { Test, TestingModule } from '@nestjs/testing';
import { TransicionService } from './transicion.service';

describe('TransicionService', () => {
  let service: TransicionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransicionService],
    }).compile();

    service = module.get<TransicionService>(TransicionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
