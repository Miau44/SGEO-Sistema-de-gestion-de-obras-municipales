import { Test, TestingModule } from '@nestjs/testing';
import { MemorandumService } from './memorandum.service';

describe('MemorandumService', () => {
  let service: MemorandumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemorandumService],
    }).compile();

    service = module.get<MemorandumService>(MemorandumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
