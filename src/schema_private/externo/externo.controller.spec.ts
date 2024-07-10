import { Test, TestingModule } from '@nestjs/testing';
import { ExternoController } from './externo.controller';
import { ExternoService } from './externo.service';

describe('ExternoController', () => {
  let controller: ExternoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternoController],
      providers: [ExternoService],
    }).compile();

    controller = module.get<ExternoController>(ExternoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
