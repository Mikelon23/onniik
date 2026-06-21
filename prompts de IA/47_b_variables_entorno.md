# Documentación de Configuración: Variables de Entorno (.env)

Este documento detalla el propósito de cada variable de entorno requerida por Onniik para su correcto funcionamiento en desarrollo y producción.

---

## 1. Clasificación de Variables de Entorno

### A. Base de Datos (Prisma)
*   `DATABASE_URL`: URI de conexión a la base de datos (por ejemplo, SQLite local o Postgres en producción).
    - Local default: `file:./dev.db`
    - Producción: `postgresql://db_user:password@localhost:5432/onniik?schema=public`

### B. Autenticación y SSO (NextAuth / Google)
*   `NEXTAUTH_URL`: URL base de la aplicación (ej. `http://localhost:3000` en local).
*   `NEXTAUTH_SECRET`: Hash utilizado para cifrar las cookies de sesión del usuario.
*   `GOOGLE_CLIENT_ID`: Identificador del cliente OAuth generado en Google Cloud Console.
*   `GOOGLE_CLIENT_SECRET`: Clave secreta del cliente OAuth de Google.

### C. Integración de Directorios y APIs (Workspace & Slack)
*   `GOOGLE_WORKSPACE_CUSTOMER_ID`: ID único de cliente corporativo para consultas de Workspace Admin SDK.
*   `SLACK_CLIENT_ID`: Identificador de la aplicación en Slack.
*   `SLACK_CLIENT_SECRET`: Clave secreta de la aplicación Slack.
*   `SLACK_SIGNING_SECRET`: Firma para validar que los webhooks provengan de Slack.

### D. Pasarela de Pagos (Stripe)
*   `STRIPE_PUBLISHABLE_KEY`: Clave pública para cargar Stripe Elements en el frontend.
*   `STRIPE_SECRET_KEY`: Clave secreta para interactuar con la API de Stripe en el backend.
*   `STRIPE_WEBHOOK_SECRET`: Clave para validar las notificaciones de eventos (pagos exitosos, fallos).
