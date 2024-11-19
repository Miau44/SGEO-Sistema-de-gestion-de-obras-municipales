import { Test, TestingModule } from '@nestjs/testing';
import { MemorandumController } from './memorandum.controller';
import { MemorandumService } from './memorandum.service';

describe('MemorandumController', () => {
  let controller: MemorandumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemorandumController],
      providers: [MemorandumService],
    }).compile();

    controller = module.get<MemorandumController>(MemorandumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
