# Acta de Aprobación de Alcance y Visión: Onniik

Este documento formaliza el cierre de la **Fase 1 (Estrategia y Planificación de Producto)** de Onniik, detallando el alcance funcional aprobado, los límites técnicos acordados para el MVP y la ruta de transición hacia la **Fase 2 (Investigación y Diseño UX/UI)**.

---

## 1. Resumen de la Visión del Producto

Onniik se consolida como una plataforma SaaS de Optimización y Gestión del Gasto en Software (SaaS Spend Management) orientada a startups y scaleups en LatAm. Su propósito es erradicar el desperdicio económico generado por licencias inactivas (*Seat Reclamation*), software duplicado (*SaaS Bloat*) e integraciones no homologadas (*Shadow IT*), apalancando automatizaciones e Inteligencia Artificial bajo la validación constante de un administrador humano (Human-in-the-loop).

---

## 2. Definición del Alcance Aprobado (MVP Scope)

Las partes interesadas ratifican la inclusión de las siguientes características principales en la versión inicial (MVP):
1.  **Conectividad Pasiva**: Sincronización mediante credenciales OAuth con el directorio corporativo de Google Workspace y Slack Workspace.
2.  **Detección de Inactividad**: Identificación de ex-empleados con licencias remanentes y usuarios activos sin actividad reciente mediante los registros de login de Google SSO.
3.  **Procesamiento de Invoices**: Motor de procesamiento asíncrono para facturas PDF (carga manual + OCR + estructuración semántica mediante GPT-4o-mini).
4.  **Onniik Copilot**: Agente de IA integrado en un chat conversacional y un generador de plantillas de correos de cancelación / negociación de contratos.

---

## 3. Límites y Exclusiones Explícitas (Fuera de Alcance)

Para mitigar riesgos y asegurar el lanzamiento ágil de la plataforma, se ratifican las siguientes exclusiones:
*   **Integraciones directas de APIs de terceros (Figma, Jira, Zoom, HubSpot, Salesforce, etc.)**: *No se desarrollarán integraciones directas con estas aplicaciones en el MVP.* La inactividad de las cuentas de estas herramientas se inferirá de forma indirecta cruzando el historial de inicio de sesión de Google SSO y el estado de la cuenta en el directorio de Google Workspace.
*   **Envío Autónomo de Correos (Acción no supervisada)**: El Agente de IA redactará borradores de correo de cancelación en `/alerts`, pero *Onniik nunca enviará correos electrónicos directamente a los proveedores de SaaS sin la aprobación y firma manual del CFO (HITL).*
*   **Procesamiento de Facturas en Tiempo Real**: El escaneo y estructuración de PDFs cargados se gestiona como una cola de tareas asíncrona; puede demorar entre 15 segundos y 2 minutos dependiendo del volumen de páginas del archivo.

---

## 4. Estructura Comercial e Híbrida Aprobada

*   **Plan Freemium**: Gratuito de por vida para startups con un gasto SaaS auditado mensual menor o igual a **$5,000 USD**. Acceso al Dashboard de visualización, pero con bloqueo de la descarga de borradores de cancelación.
*   **Plan Pro**: Costo fijo de **$99 USD/mes** + tarifa de éxito (**10% Success Fee**) calculada sobre el ahorro neto real acumulado mensual obtenido a partir del uso de las recomendaciones de Onniik, aplicable de forma consecutiva por 12 meses.

---

## 5. Acuerdos de Seguridad y Privacidad

*   **Cifrado de Credenciales**: Los tokens OAuth obtenidos de Google y Slack se almacenan cifrados simétricamente mediante `AES-256-GCM` en la base de datos de PostgreSQL. Las llaves de descifrado se aíslan como variables de entorno del servidor.
*   **Derecho al Olvido (Purga de Datos)**: Ante una desvinculación o baja de cuenta, Onniik ejecutará una purga total física (hard delete) de todos los metadatos y credenciales en un plazo máximo garantizado de **24 horas**.

---

## 6. Plan de Transición hacia la Fase 2 (Investigación y Diseño UX/UI)

Con la firma y aprobación de este documento, el proyecto Onniik transiciona a la Fase 2 del roadmap, la cual comprende los siguientes hitos:
1.  **Investigación de Usuarios (Tareas 21-22)**: Planificación y ejecución de entrevistas semiestructuradas con CFOs de startups aliadas.
2.  **Arquitectura Visual (Tareas 23-24)**: Creación de Wireframes de baja fidelidad y mapa del flujo de interacción por pantalla.
3.  **Prototipado y Diseño Final (Tareas 25-27)**: Diseño de la interfaz de usuario de alta fidelidad, prototipos interactivos y pruebas de usabilidad iniciales.
