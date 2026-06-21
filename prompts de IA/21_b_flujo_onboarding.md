# Flujo de Usuario: Proceso de Onboarding de Onniik

Este documento define la experiencia de onboarding paso a paso de Onniik, estructurando la navegación lógica, las interacciones con APIs externas (Google y Slack) y la gestión de flujos alternativos para evitar que la fricción técnica ahuyente al usuario.

---

## 1. Diagrama de Flujo de Usuario (User Flow)

El siguiente diagrama detalla la ruta del usuario desde que llega al sitio web hasta que se activa en el dashboard:

```mermaid
graph TD
    Start([Landing Page: CTA Registro]) --> G_Auth[Paso 1: Google OAuth Consent Screen]
    
    G_Auth -- Cancela o Rechaza -- > L_Page[Volver a Landing con Alerta de Requisitos]
    G_Auth -- Acepta Permisos --> DB_Onb[Backend: Crear Org & Guardar Cifrado Google Token]
    
    DB_Onb --> S_Auth[Paso 2: Vincular Slack App]
    
    S_Auth -- Omitir Paso --> Inv_Step[Paso 3: Cargar Facturas PDF]
    S_Auth -- Acepta Permisos --> DB_Slack[Backend: Guardar Cifrado Slack Token]
    
    DB_Slack --> Inv_Step
    
    Inv_Step -- Omitir / Continuar --> Act_Dash([Paso 4: Dashboard - Aha! Moment])
    Inv_Step -- Arrastrar PDF --> OCR_Proc[Procesamiento Asíncrono de OCR]
    OCR_Proc --> Act_Dash
```

---

## 2. Detalle Paso a Paso de las Pantallas

### Paso 1: Registro e Integración con Google Workspace
*   **Interfaz**: El usuario hace clic en `[ Registrarse con Google ]` en la landing page.
*   **Acción del Sistema**: Redirección a la pantalla oficial de consentimiento de Google Cloud (OAuth 2.0).
*   **Scopes Solicitados**:
    *   `.../auth/userinfo.email` e `.../auth/userinfo.profile` (para creación de cuenta).
    *   `.../auth/admin.directory.user.readonly` (para auditar cuentas activas y suspendidas).
    *   `.../auth/gmail.readonly` (para buscar correos con facturas asociadas a software).
*   **Backend**: Al recibir el código de autorización en `/api/auth/callback/google`, el backend genera la organización y el perfil de usuario administrador, encripta el token mediante `AES-256-GCM` y redirige a la pantalla interna del Paso 2.

### Paso 2: Sincronización de Slack Workspace (Opcional)
*   **Interfaz**: Tarjeta explicativa con diseño premium Glassmorphism: *"Conecta tu canal de Slack para que el Onniik Copilot audite aplicaciones instaladas y envíe alertas silenciosas de Shadow IT"*.
*   **Acciones**:
    *   Botón Primario: `[ Conectar Slack ]` (Redirige a la pantalla de instalación de Slack App).
    *   Enlace de escape: `[ Configurar más tarde ]` (Omite el paso sin romper el flujo).

### Paso 3: Carga Inicial de Facturas (Opcional)
*   **Interfaz**: Área interactiva de arrastre de archivos (Drag-and-Drop) diseñada con bordes discontinuos cianes translúcidos.
*   **Acciones**:
    *   El usuario puede arrastrar archivos PDF correspondientes a facturas recientes de software (ej., AWS, Figma, Zoom).
    *   Se muestra una barra de carga lineal para cada archivo.
    *   Botón Primario: `[ Finalizar y Ver Dashboard ]`.

---

## 3. Gestión de Casos de Borde y Excepciones

Para asegurar una alta tasa de activación, se mitigan los siguientes puntos de fricción:

### A. Rechazo de Permisos de Google:
*   Si el usuario niega el acceso a la lectura del directorio o de Gmail en la pantalla de Google, es redirigido a la Landing Page pública.
*   Se renderiza un banner informativo rojo en la parte superior: *"Onniik requiere el acceso al directorio y facturas para poder identificar tus ahorros de SaaS. Tu información nunca será compartida con terceros."*

### B. Omisión de Slack o Facturas:
*   Slack y la carga de facturas son opcionales. Si el usuario decide omitirlos, el ruteador lo redirige directamente al Dashboard (`/dashboard`).
*   **Fidelización**: Dentro del dashboard, se mostrarán widgets de estado inactivo (Empty States) con mensajes sutiles: *"Conecta Slack para detectar Shadow IT"* o *"Sube tu primera factura para mapear tus costos mensuales de software"*.

### C. Fallo en el Procesamiento OCR:
*   Si la carga de un PDF de factura falla o el formato es incompatible, el flujo de onboarding no se bloquea.
*   El backend guarda el archivo con estado `FAILED_OCR` para revisión manual silenciosa del equipo de soporte de Onniik (HITL) y permite al usuario transicionar al Dashboard.

---

## 4. Estructura Visual de Pantallas de Onboarding (Wireframe Textual)

Las interfaces del onboarding siguen la paleta Dark Mode definida en el sistema de diseño:

### Pantalla 2 (Slack Sync):
```
+-------------------------------------------------------------------------+
|  Onniik                                           [ Estado: Conectado ] |
|                                                                         |
|  PASO 2 DE 3                                                            |
|  Monitorea accesos y Shadow IT en tiempo real                           |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | [Icono Slack] Conexión de Workspace                               |  |
|  | Al conectar Slack, Onniik Copilot escaneará de forma segura las   |  |
|  | aplicaciones que tu equipo instala y enviará reportes de alertas. |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|        [ Conectar Slack ]                  [ Omitir este paso ]         |
+-------------------------------------------------------------------------+
```

### Pantalla 3 (Invoice Upload):
```
+-------------------------------------------------------------------------+
|  Onniik                                           [ Estado: Conectado ] |
|                                                                         |
|  PASO 3 DE 3                                                            |
|  Sube tus facturas para entrenar a tu Copiloto                          |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                      [ Icono de Carga PDF ]                       |  |
|  |             Arrastra tus facturas históricas aquí                 |  |
|  |              o haz clic para explorar tus archivos                |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|        [ Finalizar y Ver Dashboard ]       [ Omitir este paso ]         |
+-------------------------------------------------------------------------+
```
*   **Detalle Tipográfico**: Títulos de pantallas en tipografía **Outfit** (Semi-bold, color `--text-primary`), textos de apoyo e instructivos en tipografía **Inter** (Regular, color `--text-muted`).
