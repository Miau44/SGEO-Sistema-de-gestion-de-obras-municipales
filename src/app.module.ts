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
import { ReporteModule } from './schema_public/reporte/reporte.module';
import { DesignacionModule } from './schema_public/designacion/designacion.module';
import { RolPermisoModule } from './schema_public/rol_permiso/rol_permiso.module';
import { TipoDocumentoModule } from './schema_public/tipo_documento/tipo_documento.module';
import { DocumentoModule } from './schema_public/documento/documento.module';
import { PersonaPermisoModule } from './schema_public/persona_permiso/persona_permiso.module';
import { PersonapermisoUeModule } from './schema_public/personapermiso_ue/personapermiso_ue.module';
import { InformeInicialModule } from './schema_public/informe/informe_inicial.module';
import { EstructuraOrganizacionalModule } from './schema_sim/estructura_organizacional/estructura_organizacional.module';
import { SolicitudModule } from './schema_public/solicitud/solicitud.module';
import { FichaItemModule } from './schema_sim/ficha_item/ficha_item.module';
import { EmpresaModule } from './schema_public/empresa/empresa.module';
import { GarantiaSeguroModule } from './schema_public/garantia_seguro/garantia_seguro.module';
import { ContratoModule } from './schema_public/contrato-modificatorio/contrato.module';
import { MemorandumModule } from './schema_public/memorandum/memorandum.module';
import { SolicitudGateway } from './schema_public/solicitud/solicitud.gateway';
import { CorrelativoModule } from './schema_public/correlativo/correlativo.module';
import { ItemModule } from './schema_public/item/item.module';
import { ComputoModule } from './schema_public/computo/computo.module';
import { PlanillaModule } from './schema_public/planilla/planilla.module';
import { ModificacionPagoModule } from './schema_public/modificacion_pago/modificacion_pago.module';
import { SubrolesModule } from './schema_public/subroles/subroles.module';
import { LogModule } from './schema_public/log/log.module';
import { CorreoModule } from './schema_public/correo/correo.module';
import { DocumentoSistemaModule } from './schema_public/documento_sistema/documento_sistema.module';
import { PagoModule } from './schema_public/pago/pago.module';
import { ModuloReportesModule } from './schema_public/reporte/modulo_reportes/modulo_reportes.module';
import { AvanceFisicoModule } from './schema_public/avance_fisico/avance_fisico.module';
import { AvanceFisicoDocumentoModule } from './schema_public/avance_fisico_documento/avance_fisico_documento.module';
import { ArchivoActaModule } from './schema_public/archivo_acta/archivo_acta.module';
import { ProtocoloModule } from './schema_public/protocolo/protocolo.module';
import { SuspensionModule } from './schema_public/suspension/suspension.module';
import { LlamadaAtencionModule } from './schema_public/llamada_atencion/llamada_atencion.module';




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
      synchronize: false
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
    synchronize: false,
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
  
  InformeInicialModule,
  EstructuraOrganizacionalModule,
  SolicitudModule,   
  FichaItemModule,
  
  EmpresaModule,
  GarantiaSeguroModule,
  ContratoModule,
  MemorandumModule,
  CorrelativoModule,
  ItemModule,
  ComputoModule,
  PlanillaModule,
  ModificacionPagoModule,
  SubrolesModule,
  LogModule,
  CorreoModule,
  DocumentoSistemaModule,
  PagoModule,
  ModuloReportesModule,
  AvanceFisicoModule,
  AvanceFisicoDocumentoModule,
  ArchivoActaModule,
  ProtocoloModule, 
  SuspensionModule, LlamadaAtencionModule
  ],
  controllers: [AppController],
  providers: [AppService, ResponseService, SolicitudGateway ],
})
export class AppModule {}
