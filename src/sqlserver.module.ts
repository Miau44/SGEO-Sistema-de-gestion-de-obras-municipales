import { Module, Global, OnModuleDestroy } from '@nestjs/common';
import * as sql from 'mssql'

// Definimos un token único para la inyección de dependencias
export const SQLSERVER_CONNECTION = 'SQLSERVER_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: SQLSERVER_CONNECTION,
      useFactory: async () => {
        const config: sql.config = {
          user: process.env.DB_MSSQL_USER,
          password: process.env.DB_MSSQL_PASSWORD,
          server: process.env.DB_MSSQL_HOST || 'localhost',
          database: process.env.DB_MSSQL_NAME,
          port: parseInt(process.env.DB_MSSQL_PORT || '1433', 10),
          options: {
            encrypt: false, 
            trustServerCertificate: true, 
          },
          // Configuración del Pool (ideal para rendimiento en solo lectura)
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
          }
        };

        // Crear el pool de conexiones y conectar
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        console.log('✅ Conexión nativa a SQL Server establecida (Solo Lectura)');
        return pool;
      },
    },
  ],
  exports: [SQLSERVER_CONNECTION], // Exportamos el token para que otros módulos lo usen
})
export class SqlServerModule {}