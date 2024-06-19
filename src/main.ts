import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { AllExceptionsFilter } from './schema_public/exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalFilters(new AllExceptionsFilter());
 
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
  //.addTag('item')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
//  await app.listen(parseInt(process.env.HOST_PORT));    
  await app.listen((3001));
}
bootstrap();
