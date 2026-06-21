# Flujos Legales de Consentimiento y Autorización de Datos

Este documento define las políticas de transparencia, los permisos técnicos requeridos (API Scopes), la justificación de su uso y la interfaz visual de consentimiento (UI banners) para las integraciones de Onniik con Google Workspace y Slack. Nuestro enfoque sigue los principios de minimización de datos del Reglamento General de Protección de Datos (RGPD) y leyes de privacidad locales.

---

## 1. Principios Core de Privacidad de Onniik
1.  **Minimización de Datos (Data Minimization)**: Solo solicitamos acceso a la información estrictamente necesaria para calcular los ahorros en SaaS y detectar el Shadow IT.
2.  **Procesamiento Efímero**: No almacenamos el contenido o cuerpo de los correos que no correspondan a facturas de proveedores SaaS. El análisis de texto OCR y de LLM se ejecuta en memoria y se purga inmediatamente tras la extracción de metadatos.
3.  **Human-in-the-Loop (Aprobación del CFO)**: Onniik no toma acciones automatizadas en las plataformas conectadas; recopila datos con fines informativos y el usuario es el único que ejecuta decisiones.

---

## 2. Integración con Google Workspace

Para cruzar el directorio de empleados con el inventario de suscripciones e identificar cobros redundantes, Onniik requiere credenciales de Administrador de Google Workspace.

### Scopes Técnicos Requeridos y Justificación:

| Google API Scope | Nombre Técnico del Permiso | Justificación del Uso |
|---|---|---|
| `admin.directory.user.readonly` | Lectura del directorio de usuarios de la organización. | Mapear la lista de empleados activos y suspendidos (ex-empleados) para contrastarla con las licencias de SaaS activas e identificar cuentas huérfanas. |
| `gmail.readonly` (o `gmail.metadata` si es viable) | Lectura de mensajes de correo electrónico y metadatos. | Escanear el buzón de correo en busca de cabeceras, remitentes y palabras clave de facturas (ej. "invoice", "receipt", "billing") para construir el inventario financiero de suscripciones sin intervención manual. |

### Flujo de Interfaz de Usuario y Consentimiento Legal:
Al registrarse e iniciar el Onboarding, el administrador verá una tarjeta interactiva con la siguiente cláusula de aceptación obligatoria:

> **Consentimiento de Acceso a Google Workspace:**
> *"Al hacer clic en 'Conectar Google Workspace', autorizas a Onniik a acceder a la lista de usuarios de tu organización y escanear tu buzón de correo electrónico de administración. Onniik **únicamente** leerá y procesará metadatos e información de correos que correspondan a facturas o recibos de proveedores de software. En ningún caso almacenaremos o leeremos correos personales o de comunicación corporativa no financiera. Puedes revocar este permiso en cualquier momento desde los ajustes de tu cuenta o desde el panel de control de Google Cloud Console."*
> **[ ] He leído y acepto los términos de recolección de datos y la política de privacidad de Onniik.**

---

## 3. Integración con Slack

Para identificar las aplicaciones conectadas a los canales internos (Shadow IT), Onniik requiere conexión mediante el protocolo Slack OAuth2.

### Scopes Técnicos Requeridos y Justificación:

| Slack OAuth Scope | Nombre Técnico del Permiso | Justificación del Uso |
|---|---|---|
| `users:read` | Lectura de la lista de usuarios y correos en Slack. | Mapear las identidades de Slack con las del directorio de Google Workspace para consolidar la base de usuarios única de la organización. |
| `apps:read` | Lectura de las aplicaciones instaladas en el espacio de trabajo. | Identificar qué integraciones y bots externos han sido conectados por los empleados en los canales de Slack para auditar la gobernanza de software y evaluar riesgos de Shadow IT. |

### Flujo de Interfaz de Usuario y Consentimiento Legal:
En la sección de integraciones de la UI de Onniik, el banner del conector de Slack mostrará el siguiente texto aclaratorio antes de redirigir a la pantalla de autorización de Slack:

> **Garantía de Privacidad de Slack:**
> *"Onniik se conecta de forma segura a tu espacio de trabajo para mapear las herramientas conectadas a tus canales. **No leemos tus mensajes de texto, hilos de conversación, ni archivos compartidos en los canales de Slack.** Nuestra integración está estrictamente limitada a auditar la lista de aplicaciones de terceros instaladas en el espacio de trabajo para proteger tu gobernanza de TI."*
> **[ Conectar Slack ]**

---

## 4. Derechos de Desconexión y Purga de Datos (Derecho al Olvido)

El consentimiento otorgado por el usuario es revocable en cualquier momento, garantizando el pleno control de su información corporativa.

### Flujo de Desconexión (Opt-Out):
1.  **Revocación de Credenciales**: El usuario puede hacer clic en "Desconectar" junto a la integración en el panel de Ajustes de Onniik.
2.  **Inmediata Inhabilitación de Tokens**: El backend eliminará de forma lógica los tokens OAuth en la base de datos de PostgreSQL y enviará llamadas de invalidación (`revoke`) a las APIs de Google y Slack.

### Protocolo de Purgado de Información:
Al desconectar una integración o dar de baja la organización en Onniik, se ejecutará un job asíncrono en Redis (BullMQ) para asegurar la eliminación física de datos en un plazo máximo de 24 horas:
*   Eliminar de la base de datos todos los registros de `OAuthCredential` asociados.
*   Purga completa de los metadatos de facturación históricos y logs de actividad recopilados.
*   Envío de un correo de confirmación de eliminación de datos al administrador del sistema.
