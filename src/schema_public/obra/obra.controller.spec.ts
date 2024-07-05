import { Test, TestingModule } from '@nestjs/testing';
import { ObraController } from './obra.controller';
import { ObraService } from './obra.service';

describe('ObraController', () => {
  let controller: ObraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObraController],
      providers: [ObraService],
    }).compile();

    controller = module.get<ObraController>(ObraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
