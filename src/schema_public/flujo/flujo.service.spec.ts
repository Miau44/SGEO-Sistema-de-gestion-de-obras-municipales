import { Test, TestingModule } from '@nestjs/testing';
import { FlujoService } from './flujo.service';

describe('FlujoService', () => {
  let service: FlujoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlujoService],
    }).compile();

    service = module.get<FlujoService>(FlujoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
