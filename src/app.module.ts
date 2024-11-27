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
import { ObraModule } from './schema_public/obra/obra.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExternoModule } from './schema_private/externo/externo.module';
import { FichaModule } from './schema_public/ficha/ficha.module';
import { InstanciaFlujoModule } from './schema_public/instancia_flujo/instancia_flujo.module';
import { InstanciaTareaModule } from './schema_public/instancia_tarea/instancia_tarea.module';
import { ReporteModule } from './schema_public/reporte/reporte.module';
import { DesignacionModule } from './schema_public/designacion/designacion.module';
import { RolPermisoModule } from './schema_public/rol_permiso/rol_permiso.module';
import { TipoDocumentoModule } from './schema_public/tipo_documento/tipo_documento.module';
import { DocumentoModule } from './schema_public/documento/documento.module';
import { PersonaPermisoModule } from './schema_public/persona_permiso/persona_permiso.module';
import { PersonapermisoUeModule } from './schema_public/personapermiso_ue/personapermiso_ue.module';
import { TareaModule } from './schema_public/tarea/tarea.module';
import { FlujoModule } from './schema_public/flujo/flujo.module';
import { TransicionModule } from './schema_public/transicion/transicion.module';
import { InformeInicialModule } from './schema_public/informe/informe_inicial.module';
import { EstructuraOrganizacionalModule } from './schema_sim/estructura_organizacional/estructura_organizacional.module';
import { SolicitudModule } from './schema_public/solicitud/solicitud.module';
import { FichaItemModule } from './schema_sim/ficha_item/ficha_item.module';
import { EmpresaModule } from './schema_public/empresa/empresa.module';
import { GarantiaSeguroModule } from './schema_public/garantia_seguro/garantia_seguro.module';
import { ContratoModificatorioModule } from './schema_public/contrato-modificatorio/contrato-modificatorio.module';
import { SolicitudHistorialModule } from './schema_public/solicitud_historial/solicitud_historial.module';
import { MemorandumModule } from './schema_public/memorandum/memorandum.module';
import { SolicitudGateway } from './schema_public/solicitud/solicitud.gateway';


@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadModels: true,
      synchronize: true,
    }),
    ReporteModule,

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
    rootPath: join(__dirname, '..', 'assets'), // Directorio de tu carpeta 'assets'
    
  }),
  
  AuthModule,
  PersonaModule,
  UsersModule,
  ParametricaModule,
  ObraModule,
  ExternoModule,
  FichaModule, 
  DesignacionModule,
  RolPermisoModule,
  TipoDocumentoModule,
  DocumentoModule,
  PersonaPermisoModule,
  PersonapermisoUeModule,


  InstanciaFlujoModule,
  InstanciaTareaModule,
  TareaModule,
  FlujoModule,
  TransicionModule,
  InformeInicialModule,
  EstructuraOrganizacionalModule,
  SolicitudModule,   
  FichaItemModule,
  SolicitudHistorialModule,
  

  EmpresaModule,
  GarantiaSeguroModule,
  ContratoModificatorioModule,
  MemorandumModule,
  ],
  controllers: [AppController],
  providers: [AppService, ResponseService, SolicitudGateway ],
})
export class AppModule {}
