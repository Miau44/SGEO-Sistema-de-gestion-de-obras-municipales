import { Test, TestingModule } from '@nestjs/testing';
import { EstructuraOrganizacionalController } from './estructura_organizacional.controller';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';

describe('EstructuraOrganizacionalController', () => {
  let controller: EstructuraOrganizacionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstructuraOrganizacionalController],
      providers: [EstructuraOrganizacionalService],
    }).compile();

    controller = module.get<EstructuraOrganizacionalController>(EstructuraOrganizacionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
