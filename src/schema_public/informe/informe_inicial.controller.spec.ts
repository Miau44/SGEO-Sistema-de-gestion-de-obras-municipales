import { Test, TestingModule } from '@nestjs/testing';
import { InformeInicialController } from './informe_inicial.controller';
import { InformeInicialService } from './informe_inicial.service';


describe('InformeInicialController', () => {
  let controller: InformeInicialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeInicialController],
      providers: [InformeInicialService],
    }).compile();

    controller = module.get<InformeInicialController>(InformeInicialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
