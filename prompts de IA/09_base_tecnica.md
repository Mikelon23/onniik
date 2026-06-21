# Base Técnica y Stack de Desarrollo: Onniik

Este documento define la base tecnológica homologada para el desarrollo de la plataforma Onniik.

## Stack Tecnológico Principal

### 1. Frontend (SPA)
- **Framework**: Vite con React / Vanilla JS para máximo rendimiento y control total del DOM.
- **Estilos**: Vanilla CSS con variables personalizadas (Custom Properties) para un diseño de alto rendimiento sin sobrecarga de frameworks utilitarios, o TailwindCSS si es solicitado.
- **Gráficos**: Chart.js o Recharts para la visualización interactiva de gastos.
- **Cliente HTTP**: Axios para la comunicación asíncrona con la API.

### 2. Backend (API Gateway & Processing)
- **Entorno**: Node.js con TypeScript para mayor robustez en el tipado de datos.
- **Framework Web**: Express.js para estructurar el ruteador y controladores REST.
- **Base de Datos (ORM)**: Prisma ORM para facilitar las consultas relacionales y migraciones ágiles.
- **Colas y Tareas en Segundo Plano**: Redis + BullMQ para gestionar las integraciones asíncronas de Google y Slack.

### 3. Base de Datos e Infraestructura
- **Base de Datos Principal**: PostgreSQL (Almacenamiento de usuarios, organizaciones, suscripciones y logs).
- **Base de Datos In-Memory**: Redis (Manejo de sesiones, colas de BullMQ y almacenamiento de caché).
- **Contenedores**: Docker y Docker Compose para homologar entornos locales y de producción.

---

## Dependencias de Terceros Críticas

### Autenticación y Seguridad
- `jsonwebtoken`: Gestión de tokens JWT para sesiones protegidas.
- `bcryptjs`: Algoritmo de hashing seguro de contraseñas.
- `helmet`: Cabeceras HTTP de seguridad para Express.

### Procesamiento de IA y Documentos
- `openai`: SDK oficial para conectar el motor de recomendaciones y chat de IA.
- `pdf-parse`: Extractor básico de texto de facturas PDF locales para envío al LLM.
- `@google-cloud/local-auth` / `googleapis`: Librerías oficiales para el Onboarding OAuth de Google Workspace.

### Monitoreo y Logging
- `winston` / `pino`: Registro estructurado de logs locales.
- `sentry` / `datadog`: Reportes automáticos de errores en producción.
