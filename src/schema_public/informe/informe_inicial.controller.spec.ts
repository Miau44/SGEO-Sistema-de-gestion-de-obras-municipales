import { Test, TestingModule } from '@nestjs/testing';
import { InformeController } from './informe_inicial.controller';
import { InformeService } from './informe_inicial.service';


describe('InformeInicialController', () => {
  let controller: InformeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeController],
      providers: [InformeService],
    }).compile();

    controller = module.get<InformeController>(InformeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
