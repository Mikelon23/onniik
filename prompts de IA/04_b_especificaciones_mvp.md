# Especificaciones del Producto Mínimo Viable (MVP): Onniik

Este documento detalla el alcance funcional, técnico y operativo del MVP de Onniik, definiendo qué características están incluidas (In-Scope) para un desarrollo ágil de 6 semanas, y cuáles se posponen (Out-of-Scope).

---

## 1. Objetivos del MVP
*   **Validar la propuesta de valor**: Confirmar si el usuario encuentra y ejecuta ahorros significativos en su primera sesión.
*   **Reducir fricción de seguridad**: Mitigar el temor a conectar accesos intrusivos ofreciendo una carga manual de facturas y visualización pasiva.
*   **Lanzar rápido**: Minimizar integraciones API complejas y sistemas de entrega de correos directos de terceros.

---

## 2. Alcance Funcional: Incluido (In-Scope)

### A. Módulo de Onboarding y Autenticación
*   **Autenticación**: Inicio de sesión único mediante **Google SSO**. Se elimina el registro por correo y contraseña tradicional para acelerar el desarrollo y garantizar cuentas corporativas.
*   **Creación de Organización**: Flujo automático para vincular al usuario a su organización corporativa basada en el dominio de su email (ej. `empresa.com`).

### B. Módulo de Integraciones (Conexión Pasiva)
*   **Google Workspace Directory**: Conexión vía OAuth solo para lectura del directorio de usuarios corporativos. Esto permite identificar la lista de empleados actuales y detectar cuentas suspendidas.
*   **Slack Integration (Slack App)**: Lectura de la lista de aplicaciones e integraciones instaladas en el espacio de trabajo de Slack, clasificando el nivel de riesgo de permisos del bot.

### C. Módulo de Detección de Gasto (Facturación)
*   **Carga Manual de Facturas (Drag & Drop)**: Permite al usuario subir archivos PDF de facturas de SaaS (Notion, Figma, Slack, Zoom, etc.).
*   **Procesamiento OCR por IA**:
    *   Uso de una librería OCR básica para extraer texto.
    *   API de OpenAI (GPT-4o-mini) para estructurar el texto extraído en JSON conteniendo: Nombre del Proveedor, Monto de la factura, Moneda, Fecha de facturación y Periodicidad.

### D. Módulo de Optimización (Reclamación de Licencias)
*   **Detección de Asientos de Ex-empleados**: Cruce de la lista de empleados activos en Google Workspace vs. correos asignados en la tabla de facturación manual de SaaS. Si un email de ex-empleado tiene licencia activa, se dispara una alerta.
*   **Tabla Simplificada de Suscripciones**: Listado interactivo en el dashboard mostrando: Software, Costo Mensual, Estado (Activo/Inactivo), y Nivel de Uso Estimado (basado en el SSO de Google).

### E. Módulo de AI Agent (Human-in-the-Loop)
*   **Redacción de Borradores**: Generación automática de correos formales solicitando cancelación de suscripción o reembolso parcial de licencias inactivas mediante GPT-4o-mini.
*   **Envío con Enlace `mailto:`**: En lugar de configurar servidores SMTP complejos que puedan caer en spam, el botón "Enviar con mi correo" abre el cliente de correo del usuario (Gmail, Outlook) pre-cargando el destinatario, asunto y cuerpo del mensaje. El usuario revisa y envía desde su propio buzón.

---

## 3. Alcance Funcional: Excluido (Out-of-Scope)

Las siguientes funciones se posponen para la Versión 1.0 post-validación del MVP:
*   **Escaneo automático de Gmail**: Para evitar objeciones inmediatas de seguridad de datos por parte del CFO/IT Manager.
*   **Integraciones directas de API de uso con SaaS individuales**: No se integrarán APIs directas de Figma, HubSpot, Zoom o Jira en la primera versión. Toda la inactividad se inferirá a través del estado de Google Directory y logins SSO.
*   **Envío directo de emails por Onniik**: Evita lidiar con la reputación de dominio, entregabilidad y spam en la fase inicial.
*   **Chat interactivo conversacional**: Se reemplaza por un botón directo de acción rápida que genera los borradores requeridos.
*   **Pasarela de pagos real (Stripe)**: Las suscripciones Pro se simularán en la interfaz sin cobro real con tarjeta bancaria. El cobro del éxito se facturará manualmente.

---

## 4. Criterios de Aceptación del MVP (Exit Criteria)

El MVP se considerará exitoso si cumple con las siguientes pruebas técnicas de extremo a extremo:
1.  **Onboarding exitoso**: Un usuario se registra vía Google SSO y conecta su Google Directory en menos de 90 segundos.
2.  **Carga y digitalización correcta**: Al subir un PDF de factura de Figma de $300 USD, la IA extrae con 100% de precisión el emisor, costo y fecha.
3.  **Detección de alerta**: El sistema detecta y resalta en rojo a un ex-empleado (inactivo en Google Directory) que sigue figurando en la lista de licencias.
4.  **Generación de Correo**: Al dar clic en "Reclamar Asiento", se genera un link `mailto:` con un cuerpo formal y correcto de correo de soporte.
