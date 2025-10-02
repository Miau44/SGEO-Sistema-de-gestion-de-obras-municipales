import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { AllExceptionsFilter } from './schema_public/exception'; 
import { inicioCronJobs } from './schema_sim/utils/cron-jobs'; // Asegúrate de que la ruta sea correcta
import { ficha_itemService } from './schema_sim/ficha_item/ficha_item.service';
import { ContratoService } from './schema_public/contrato-modificatorio/contrato.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new AllExceptionsFilter());
  //para documentos adjuntos
  app.use(express.static('documentos-tramites'));
  app.use(express.json({ limit: '50mb' })); 
  //
  app.use((req:any, res:any, next:any) => {
    res.setTimeout(1800000, () => {
      const err = new Error('Tiempo de espera agotado');
      next(err);
    });
    next();
  });

  const config = new DocumentBuilder()
  .addBearerAuth()
  .setTitle('Sistema de Gestión de Obras')
  .setDescription('Descripción de la API de  Gestión de Obras')
  .setVersion('1.0')
 
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(Number(process.env.HOST_PORT));    
  inicioCronJobs({
    ficha_itemservice: app.get(ficha_itemService),
    contratoservice: app.get(ContratoService),
  });
}
bootstrap();
