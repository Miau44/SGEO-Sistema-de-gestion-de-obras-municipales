import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreoService } from './correo.service';
import { CorreoController } from './correo.controller';
import { Correo } from './entities/correo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Correo])],
  controllers: [CorreoController],
  providers: [CorreoService],
  exports: [CorreoService]
})
export class CorreoModule {}
