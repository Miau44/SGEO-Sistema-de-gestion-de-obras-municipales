import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './schema_public/auth/auth.module';
import { PersonaModule } from './schema_public/persona/persona.module';
import { UsersModule } from './schema_public/users/users.module';
import { ParametricaModule } from './schema_public/parametrica/parametrica.module';
import { ResponseService } from './response.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT)  ,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'documentos-tramites'),
    serveRoot: '/documentos-tramites/',
  }),
  
  AuthModule,
  PersonaModule,
  UsersModule,
  ParametricaModule

  

  ],
  controllers: [AppController],
  providers: [AppService, ResponseService],
})
export class AppModule {}
