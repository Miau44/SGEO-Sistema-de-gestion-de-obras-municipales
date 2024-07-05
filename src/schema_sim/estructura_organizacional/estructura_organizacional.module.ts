import { Module } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { EstructuraOrganizacionalController } from './estructura_organizacional.controller';

@Module({
  controllers: [EstructuraOrganizacionalController],
  providers: [EstructuraOrganizacionalService],
})
export class EstructuraOrganizacionalModule {}
