import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class EmpresaModule {}
