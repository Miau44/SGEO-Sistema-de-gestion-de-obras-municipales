import { Module } from '@nestjs/common';
import { PersonapermisoUeService } from './personapermiso_ue.service';
import { PersonapermisoUeController } from './personapermiso_ue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonapermisoUe } from './entities/personapermiso_ue.entity';
import { ResponseService } from 'src/response.service';



@Module({
  imports: [TypeOrmModule.forFeature([PersonapermisoUe])],

  controllers: [PersonapermisoUeController],
  providers: [PersonapermisoUeService, ResponseService],
})
export class PersonapermisoUeModule {}
