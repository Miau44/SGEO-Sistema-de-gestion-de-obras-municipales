import { Test, TestingModule } from '@nestjs/testing';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';

describe('EstructuraOrganizacionalService', () => {
  let service: EstructuraOrganizacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstructuraOrganizacionalService],
    }).compile();

    service = module.get<EstructuraOrganizacionalService>(EstructuraOrganizacionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
