# Guía de Configuración: Registrar Onniik en Google Cloud Console (OAuth 2.0)

Esta guía detalla el procedimiento paso a paso para registrar la aplicación Onniik en **Google Cloud Console**, habilitar las APIs necesarias de Google Workspace y obtener las credenciales `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

---

## Paso 1: Crear o Seleccionar un Proyecto en Google Cloud

1. Accede a [Google Cloud Console](https://console.cloud.google.com/).
2. Haz clic en el selector de proyectos en la parte superior y selecciona **Nuevo Proyecto**.
3. Ingresa el nombre del proyecto (ej. `Onniik-SaaS-Optimizer`) y selecciona la Organización / Ubicación correspondiente.
4. Haz clic en **Crear**.

---

## Paso 2: Habilitar las APIs de Google Requeridas

En el menú lateral izquierdo, ve a **APIs y servicios > Biblioteca** y habilita las siguientes APIs:

1. **Admin SDK API** (Google Workspace Directory API):
   - Necesaria para consultar usuarios y empleados de la organización (`admin.directory.user.readonly`).
2. **Gmail API**:
   - Necesaria para buscar correos e historial de facturación de proveedores SaaS (`gmail.readonly`).
3. **Google People API / Userinfo API**:
   - Necesaria para obtener el perfil básico del usuario autenticado.

---

## Paso 3: Configurar la Pantalla de Consentimiento de OAuth

1. Ve a **APIs y servicios > Pantalla de consentimiento de OAuth**.
2. Selecciona el Tipo de Usuario:
   - **Interno**: Si solo usuarios de la organización Google Workspace de la empresa podrán acceder.
   - **Externo**: Si se admitirá acceso multi-inquilino (*multi-tenant*).
3. Completa los datos de la aplicación:
   - **Nombre de la aplicación**: `Onniik SaaS Cost Freezer`
   - **Correo de soporte del usuario**: `admin@onniik.com`
   - **Dominios autorizados**: `onniik.com` (en producción)
4. Agrega los **Permisos (Scopes)** requeridos:
   - `openid`
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
   - `.../auth/admin.directory.user.readonly`
   - `.../auth/gmail.readonly`
5. Guarda y continua.

---

## Paso 4: Crear Credenciales Client ID de OAuth 2.0

1. Ve a **APIs y servicios > Credenciales**.
2. Haz clic en **+ Crear credenciales > ID de cliente de OAuth**.
3. Selecciona **Tipo de aplicación**: `Aplicación web`.
4. Nombre: `Onniik Web Client`.
5. **Orígenes de JavaScript autorizados**:
   - `http://localhost:3000` (Desarrollo Frontend)
   - `http://localhost:5000` (Desarrollo Backend)
   - `https://app.onniik.com` (Producción)
6. **URIs de redireccionamiento autorizados**:
   - `http://localhost:5000/api/v1/auth/google/callback`
   - `https://api.onniik.com/api/v1/auth/google/callback`
7. Haz clic en **Crear**.

---

## Paso 5: Guardar Credenciales en Variables de Entorno

Copia el **ID de cliente** y el **Secreto de cliente** generados y configúralos en tu archivo `.env`:

```env
GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123xyz456"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/v1/auth/google/callback"
```
