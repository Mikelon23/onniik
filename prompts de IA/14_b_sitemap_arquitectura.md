# Arquitectura de la Información y Sitemap: Onniik

Este documento define la estructura jerárquica de contenidos, navegación y ruteo tanto para la Landing Page pública como para la aplicación web privada (Dashboard) de Onniik.

---

## 1. Estructura de la Landing Page Pública (Sitio Web)

El sitio web público tiene como objetivo principal captar el interés de CFOs e IT Managers y convertirlos mediante el botón de registro único con Google SSO.

### Secciones de la Landing Page (Single Page Application con Anclas):
1.  **Cabecera (Header)**:
    *   Logotipo: `Onniik` (color cían).
    *   Menú de Navegación: `Funcionalidades`, `Precios`, `Preguntas Frecuentes`.
    *   Botón Primario: `[ Registrarse con Google ]` (OAuth Google SSO).
2.  **Sección Héroe (Hero Section)**:
    *   Título Principal: *"Mete tu gasto en SaaS en el congelador. Derrite tus costos operativos."*
    *   Subtítulo: *"Conecta Google Workspace y Slack en 5 minutos. Onniik identifica de forma autónoma el desperdicio económico, detecta Shadow IT y redacta correos de cancelación listos para enviar."*
    *   Llamada a la Acción (CTA): `[ Iniciar Auditoría Gratuita ]` (OAuth Google).
    *   Prueba Social (Social Proof): *"Auditando más de $2.5M USD en software recurrentes en startups de LatAm."*
3.  **Visualización Simulada del Panel (Interactive Demo Block)**:
    *   Simulación interactiva de una tarjeta de KPI con glow cían que muestra: *"Ahorro Proyectado: $1,450 USD/mes"*.
4.  **Sección de Módulos (How It Works)**:
    *   *Módulo 1: Conectividad Pasiva*: Sincronización en 2 min con Google SSO y Slack API.
    *   *Módulo 2: Detección Inteligente*: Detección de cuentas huérfanas de ex-empleados y Shadow IT.
    *   *Módulo 3: Automatización HITL*: Redacción de correos con el Agente de IA para cancelación y negociación de licencias.
5.  **Sección de Precios (Pricing)**:
    *   *Plan Free*: Auditoría inicial de hasta $5,000 USD al mes auditados. Costo: $0 USD.
    *   *Plan Pro*: Auditoría ilimitada. Costo: $99 USD/mes + 10% de tarifa de éxito sobre el ahorro neto real logrado por 12 meses.
    *   *Plan Enterprise*: Tarifas fijas personalizadas para empresas de más de 150 empleados.
6.  **Preguntas Frecuentes (FAQ - Acordeón interactivo)**:
    *   Preguntas sobre seguridad de datos, acceso de lectura de Gmail, cómo funciona la comisión por éxito y cómo cancelar la cuenta.
7.  **Pie de Página (Footer)**:
    *   Enlaces legales: Política de Privacidad, Términos de Servicio (TOS).
    *   Contacto de soporte técnico y redes sociales corporativas.

---

## 2. Estructura de la Aplicación Privada (Dashboard App)

Una vez que el usuario inicia sesión vía Google SSO, accede al ruteador interno de la aplicación web de Onniik.

### Estructura de Rutas y Navegación:

```mermaid
graph TD
    A[Inicio de Sesión: Google SSO] --> B{¿Organización configurada?}
    B -- No --> C[/onboarding]
    B -- Sí --> D[Layout Principal]
    
    D --> E[/dashboard]
    D --> F[/subscriptions]
    D --> G[/alerts]
    D --> H[/chat]
    D --> I[/integrations]
    D --> J[/settings]
```

*   **`/onboarding`**: Flujo de primer ingreso paso a paso:
    *   Paso 1: Conectar Google Workspace (OAuth Directory + Gmail).
    *   Paso 2: Conectar Slack Workspace (OAuth Apps).
    *   Paso 3: Carga manual opcional de facturas históricas en PDF.
*   **`/dashboard`**: Vista general financiera para el CFO:
    *   Tarjetas de KPIs (Ahorro Total, Gasto Proyectado, Shadow IT detectados).
    *   Gráfico de tendencias temporales de costos.
    *   Tabla rápida con las 5 herramientas de software que presentan mayor desperdicio de uso.
*   **`/subscriptions`**: Inventario de suscripciones detectadas:
    *   Tabla interactiva de productos de software (Costo mensual, responsable de TI, cantidad de usuarios asignados y última fecha de actividad).
    *   Filtros: Por Departamento, Estatus (Aprobada / Desconocida / Crítica) y Costo.
    *   *Sub-ruta*: `/subscriptions/:id` (Vista de detalle individual por software, logs de usuarios con correos electrónicos asociados y estado de actividad).
*   **`/alerts`**: El centro de control de optimización:
    *   Tarjetas apiladas de alertas de ahorro (ej. *"Se detectó que el correo de un ex-empleado sigue asignado a una cuenta de Jira"*).
    *   Acciones: `[Descartar]` o `[Optimizar con IA]`.
    *   *Sub-ruta*: `/alerts/:id/draft` (Modal de previsualización y edición manual del correo de cancelación redactado por el Agente de IA para su posterior envío).
*   **`/chat`**: Interfaz de chat conversacional con `Onniik Copilot`:
    *   Panel interactivo para realizar consultas financieras y solicitar redacciones directas sobre el estado de las herramientas SaaS de la organización.
*   **`/integrations`**: Panel de control de conectividad técnica:
    *   Estado de las conexiones activas, scopes vigentes, fecha de última sincronización exitosa y botones de desconexión rápida.
*   **`/settings`**: Panel administrativo de la startup:
    *   *Perfil*: Nombre y rol del usuario.
    *   *Organización*: Datos corporativos, listado de miembros del equipo e invitación de nuevos colaboradores.
    *   *Facturación*: Método de pago corporativo de la tarjeta del plan Onniik y listado de facturas emitidas por comisiones de éxito.

---

## 3. Jerarquía del Layout General de la App

Toda la aplicación privada comparte una plantilla unificada (App Layout) para garantizar la coherencia en la navegación:
*   **Panel Lateral (Sidebar)**: Menú de navegación fijo en la parte izquierda. Permite transitar entre `/dashboard`, `/subscriptions`, `/alerts`, `/chat`, `/integrations` y `/settings`. En la parte inferior, muestra el perfil del usuario activo y el botón de cierre de sesión.
*   **Barra Superior (Header)**: Muestra el título de la vista activa, un indicador verde de sincronización exitosa de las APIs y el botón de notificaciones pendientes (campana).
*   **Área de Contenido (Main View)**: Contenedor central flexible donde se renderizan las vistas de las rutas seleccionadas.

---

## 4. Control de Acceso por Roles (RBAC Routing Control)

De acuerdo con el documento de definición de roles (`10_roles_de_usuario.md`), el ruteador de la aplicación restringirá el acceso a ciertas vistas según la función asignada al usuario:

| Ruta de la App | Admin / CFO | IT Manager | Reader (Lector) |
|---|---|---|---|
| `/dashboard` | Acceso Total | Acceso Total | Acceso Total |
| `/subscriptions` | Acceso Total | Acceso Total | Acceso Total |
| `/alerts` | Acceso Total | Solo Lectura / No ejecuta correos | Solo Lectura / No ejecuta correos |
| `/chat` | Acceso Total | Acceso Total | Acceso Total (Sin permisos de modificación) |
| `/integrations` | Acceso Total (Conectar/Desconectar) | Acceso Total (Conectar/Desconectar) | Bloqueado (Redirección a Dashboard) |
| `/settings` | Acceso Total | Ver Miembros / No edita métodos de pago | Bloqueado (Redirección a Dashboard) |
