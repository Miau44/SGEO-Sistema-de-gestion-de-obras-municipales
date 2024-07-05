import { Test, TestingModule } from '@nestjs/testing';
import { ObraService } from './obra.service';

describe('ObraService', () => {
  let service: ObraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObraService],
    }).compile();

    service = module.get<ObraService>(ObraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
