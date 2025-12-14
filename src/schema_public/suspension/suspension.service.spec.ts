import { Test, TestingModule } from '@nestjs/testing';
import { SuspensionService } from './suspension.service';

describe('SuspensionService', () => {
  let service: SuspensionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuspensionService],
    }).compile();

    service = module.get<SuspensionService>(SuspensionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
