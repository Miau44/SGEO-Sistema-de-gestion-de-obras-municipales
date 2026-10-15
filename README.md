# SGEO — Sistema de Gestión de Obras Municipales

Backend API para administrar el ciclo de vida de obras municipales: registro, asignaciones, documentación, seguimiento físico, trámites administrativos, informes y pagos. El repositorio contiene el backend NestJS; la interfaz web y las bases de datos se despliegan por separado.

## Alcance funcional

- **Acceso y organización:** autenticación JWT, personas y usuarios, roles, subroles, permisos, designaciones y estructura organizacional.
- **Obras y contratos:** obras, empresas, fichas, ítems, contratos y modificaciones contractuales, garantías y seguros.
- **Trámites y estados:** solicitudes, historial y estados, correlativos, memorándums, protocolos, suspensiones, llamadas de atención y comunicados.
- **Seguimiento técnico:** cómputos, criterios y observaciones, planillas, avances físicos y documentos asociados a los avances.
- **Informes y pagos:** informes iniciales y de obra, informes para fiscalización y supervisión, reportes generales, pagos, descuentos y modificaciones de pago.
- **Documentos y auditoría:** carga y consulta de documentos y actas, generación de documentos e informes, registros de actividad y avisos por correo.

La API incluye endpoints REST documentados con Swagger en `/api` y un gateway Socket.IO para eventos de solicitudes. Los trabajos programados y alertas están implementados en el backend.

## Tecnología e integraciones

- NestJS 10 y TypeScript.
- PostgreSQL, con módulos que usan TypeORM y Sequelize.
- Integración configurada con SQL Server para módulos que consultan ese origen.
- JWT/Passport para autenticación; validación de datos mediante `class-validator`.
- Socket.IO, Swagger, PDFMake, Puppeteer y XLSX para comunicación en tiempo real, documentación y procesamiento de informes.
- Archivos estáticos y adjuntos servidos por el backend; la operación requiere configurar y respaldar el almacenamiento correspondiente.

## Requisitos de despliegue

- Node.js y npm compatibles con las dependencias del proyecto.
- Una base de datos PostgreSQL accesible y con el esquema esperado por las entidades.
- SQL Server solo si se habilitan las funciones que lo requieren.
- Variables de entorno configuradas a partir de `.env.example`.

La sincronización automática de esquemas está deshabilitada en la configuración. Este repositorio no incluye un proceso de migraciones de base de datos; coordine el esquema con la instalación de SGEO correspondiente antes de iniciar una instancia nueva.

## Configuración local

```bash
npm install
```

Copie `.env.example` a `.env`, complete los valores para su entorno y luego ejecute:

```bash
npm run start:dev
```

Para compilar y arrancar la versión compilada:

```bash
npm run build
npm run start:prod
```

La API escucha en el puerto indicado por `HOST_PORT`. Swagger queda disponible en `/api`.

## Variables de entorno

`.env.example` enumera las variables reconocidas por la configuración actual. Las credenciales, secretos JWT, direcciones de servicios y datos de conexión son específicos de cada instalación. No publique archivos `.env` ni credenciales reales en Git.

## Estructura del código

- `src/schema_public/`: módulos principales de la API de gestión de obras.
- `src/schema_private/`: endpoints auxiliares para integración con usuarios o sistemas externos.
- `src/schema_sim/`: consultas y funcionalidades asociadas a SIM, incluyendo estructura organizacional y fichas de ítems.
- `src/common/`: utilidades compartidas.
- `assets/`: imágenes y fuentes utilizadas en documentos.
- `test/`: configuración y pruebas automatizadas del proyecto.

Cada área NestJS separa controladores, servicios, entidades y DTOs para exponer endpoints y procesar sus operaciones.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm run start:dev` | Ejecutar en modo desarrollo con recarga |
| `npm run build` | Compilar el backend |
| `npm run start:prod` | Ejecutar desde `dist/` |
| `npm test` | Ejecutar pruebas unitarias configuradas |
| `npm run test:e2e` | Ejecutar pruebas end-to-end |
| `npm run lint` | Aplicar ESLint al código TypeScript |

## Notas de operación

El backend depende de la disponibilidad y configuración correcta de las bases de datos y servicios externos de cada instalación. Antes de transferir o desplegar, documente el esquema de base de datos, las integraciones, el almacenamiento de adjuntos, los procesos programados y los permisos de acceso. Revise también las licencias de las dependencias y los derechos de uso de datos, marcas, plantillas y documentos incluidos.
