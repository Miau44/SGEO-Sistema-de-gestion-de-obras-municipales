import { Test, TestingModule } from '@nestjs/testing';
import { DesignacionService } from './designacion.service';

describe('DesignacionService', () => {
  let service: DesignacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DesignacionService],
    }).compile();

    service = module.get<DesignacionService>(DesignacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
