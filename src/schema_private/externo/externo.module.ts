import { Module } from '@nestjs/common';
import { ExternoService } from './externo.service';
import { ExternoController } from './externo.controller';


@Module({
  controllers: [ExternoController],
  providers: [ExternoService],
})
export class ExternoModule {}
