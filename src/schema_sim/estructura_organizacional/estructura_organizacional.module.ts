import { Module } from '@nestjs/common';
import { EstructuraOrganizacionalService } from './estructura_organizacional.service';
import { EstructuraOrganizacionalController } from './estructura_organizacional.controller';
import { ResponseService } from 'src/response.service';
import { EstructuraOrganizacional } from './entities/estructura_organizacional.entity';
import { EstructuraOrganizacionalNuevo } from './entities/estructura_organizacional_nuevo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([EstructuraOrganizacional, EstructuraOrganizacionalNuevo])],

  controllers: [EstructuraOrganizacionalController],
  providers: [EstructuraOrganizacionalService, ResponseService],
})
export class EstructuraOrganizacionalModule {}