# Validación Técnica de APIs en Sandbox: Google Workspace y Slack

Este documento detalla los pasos técnicos de configuración, autorización y simulación de llamadas para las integraciones de Onniik con las APIs de Google Workspace y Slack en entornos de desarrollo y pruebas (Sandbox).

---

## 1. Integración con Google Workspace (Sandbox Developer Setup)

Para realizar pruebas sin afectar cuentas de producción, se recomienda configurar un inquilino de prueba (Google Workspace Developer Sandbox).

### A. Pasos en Google Cloud Console:
1.  **Crear un Proyecto**: Crear el proyecto `onniik-sandbox` en Google Cloud.
2.  **Habilitar APIs**: Activar las APIs **Admin SDK API** (para directorio de usuarios) y **Gmail API** (para lectura de facturas).
3.  **Configurar Pantalla de Consentimiento OAuth**:
    *   Tipo de usuario: *Externo*.
    *   Estado de publicación: *En pruebas (Testing)*.
    *   Añadir usuarios de prueba (test accounts del sandbox).
4.  **Generar Credenciales**:
    *   Crear credenciales de tipo **ID de cliente de OAuth 2.0** (Aplicación web).
    *   Configurar los orígenes autorizados (ej., `http://localhost:3000`) y URIs de redireccionamiento (ej., `http://localhost:3000/auth/google/callback`).
    *   Descargar el archivo JSON secreto del cliente y guardarlo como `credentials.json` en las variables de entorno del backend.

### B. Código Mock de Simulación (Node.js) para Google SDK:

```javascript
const { google } = require('googleapis');

// Scopes requeridos
const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/gmail.readonly'
];

/**
 * Simulación de consulta del Directorio de Google Workspace (Obtener usuarios inactivos o suspendidos)
 */
async function mockFetchDirectoryUsers(auth) {
  const service = google.admin({ version: 'directory_v1', auth });
  try {
    const response = await service.users.list({
      customer: 'my_customer',
      maxResults: 50,
      orderBy: 'email',
      query: 'isSuspended=true' // Filtramos por empleados suspendidos (ex-empleados)
    });
    
    const users = response.data.users || [];
    console.log('Usuarios suspendidos encontrados en Sandbox:');
    users.forEach(user => {
      console.log(`- ${user.primaryEmail} (Suspendido el: ${user.suspendedTime || 'N/A'})`);
    });
    return users;
  } catch (error) {
    console.error('Error al consultar el directorio de Google Workspace:', error.message);
    throw error;
  }
}

/**
 * Simulación de búsqueda de correos de facturación en Gmail
 */
async function mockSearchBillingEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const query = 'subject:(invoice OR bill OR receipt OR factura) has:attachment';
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10
    });
    
    const messages = response.data.messages || [];
    console.log(`Mensajes de facturación detectados en Sandbox (${messages.length}):`);
    for (const msg of messages) {
      const msgDetails = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });
      console.log(`- ID: ${msg.id} | Asunto: ${msgDetails.data.snippet}`);
    }
    return messages;
  } catch (error) {
    console.error('Error al escanear Gmail en Sandbox:', error.message);
    throw error;
  }
}
```

---

## 2. Integración con Slack (Sandbox Developer Setup)

Para probar la detección de Shadow IT en Slack, se debe crear una aplicación en un espacio de trabajo de desarrollo propio.

### A. Pasos en Slack Developer Portal:
1.  **Crear Slack App**: Ir a [api.slack.com/apps](https://api.slack.com/apps) y seleccionar *Create New App* -> *From scratch*. Asociarla al espacio de trabajo de pruebas (Sandbox Workspace).
2.  **Configurar Scopes (OAuth & Permissions)**:
    *   Navegar a *Scopes* -> *User Token Scopes*.
    *   Añadir Scopes: `users:read` (obtener lista de usuarios) y `apps:read` (auditar integraciones instaladas).
3.  **Instalar en el Workspace**: Hacer clic en *Install to Workspace* para autorizar la aplicación y obtener el **User OAuth Token** (comienza con `xoxp-`).

### B. Código Mock de Simulación (Node.js) para Slack Web API:

```javascript
const { WebClient } = require('@slack/web-api');

// Inicialización del cliente con el token del Sandbox
const token = process.env.SLACK_SANDBOX_USER_TOKEN || 'xoxp-mock-token-123456';
const web = new WebClient(token);

/**
 * Simulación de auditoría de integraciones instaladas en Slack (Shadow IT Detection)
 */
async function mockAuditInstalledApps() {
  try {
    console.log('Iniciando auditoría de integraciones instaladas en Slack...');
    const result = await web.apps.connections.list({
      limit: 100
    });
    
    // Si la API apps.connections requiere permisos enterprise, usamos listado alternativo de integraciones
    // o el endpoint de historial de integraciones del workspace.
    const apps = result.connections || [];
    console.log(`Se detectaron ${apps.length} integraciones activas en el Sandbox.`);
    return apps;
  } catch (error) {
    // Manejo de fallback para workspaces estándar de Slack
    if (error.code === 'slack_webapi_platform_error') {
      console.warn('Advertencia: Endpoint limitado. Utilizando simulación de inventario local.');
      return [
        { app_id: 'A123', name: 'Trello', status: 'unknown' },
        { app_id: 'A456', name: 'Giphy', status: 'unknown' }
      ];
    }
    console.error('Error al auditar Slack Apps:', error.message);
    throw error;
  }
}
```

---

## 3. Control de Cuotas, Límites (Rate Limits) y Errores HTTP 429

Las APIs de terceros tienen estrictos límites de llamadas que Onniik debe gestionar para evitar interrupciones de sincronización.

### Resumen de Límites de Velocidad:
*   **Google Directory API**: Límite de cuota general de **1,500 peticiones por cada 100 segundos** por cuenta de usuario.
*   **Slack Web API**: Aplica límites por niveles (Tiers). El endpoint `users.list` es **Tier 2** (20 llamadas por minuto) y `apps.connections` es **Tier 3** (50 llamadas por minuto).

### Estrategia de Mitigación (Exponential Backoff):
El backend implementará un middleware de reintento automático para manejar códigos de estado **HTTP 429 (Too Many Requests)**.

```javascript
/**
 * Helper genérico de reintentos exponenciales para llamadas de API de Sandbox
 */
async function executeApiCallWithRetry(apiCallFn, retries = 3, delay = 1000) {
  try {
    return await apiCallFn();
  } catch (error) {
    // Si el error es por límite de velocidad (HTTP 429) o rate limit de Slack
    const isRateLimit = error.status === 429 || error.message.includes('ratelimited');
    
    if (isRateLimit && retries > 0) {
      console.warn(`Límite de velocidad alcanzado. Reintentando en ${delay}ms... (Intentos restantes: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeApiCallWithRetry(apiCallFn, retries - 1, delay * 2); // Exponencial
    }
    throw error;
  }
}
```
