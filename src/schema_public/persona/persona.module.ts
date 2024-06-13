import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';


@Module({

  imports: [TypeOrmModule.forFeature([Persona])],

  controllers: [PersonaController],
  providers: [PersonaService],
})
export class PersonaModule {}
