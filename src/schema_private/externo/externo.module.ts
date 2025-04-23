import { Module } from '@nestjs/common';
import { ExternoService } from './externo.service';
import { ExternoController } from './externo.controller';
import { LogModule } from 'src/schema_public/log/log.module';
import { ResponseService } from 'src/response.service';

@Module({
  imports: [LogModule],
  controllers: [ExternoController],
  providers: [ExternoService,ResponseService],
})
export class ExternoModule {}
