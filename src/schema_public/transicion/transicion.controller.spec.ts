import { Test, TestingModule } from '@nestjs/testing';
import { TransicionController } from './transicion.controller';
import { TransicionService } from './transicion.service';

describe('TransicionController', () => {
  let controller: TransicionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransicionController],
      providers: [TransicionService],
    }).compile();

    controller = module.get<TransicionController>(TransicionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
