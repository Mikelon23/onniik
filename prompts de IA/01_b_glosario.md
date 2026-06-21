# Glosario de Términos Técnicos y Comerciales: Onniik

Este glosario define el vocabulario clave utilizado en los ámbitos comercial, técnico y financiero del proyecto Onniik para estandarizar la comunicación del equipo y la lógica del software.

---

## 1. Términos Comerciales y Financieros

*   **SaaS Spend Management (Gestión de Gastos en SaaS)**: Práctica empresarial de monitorear, analizar y optimizar el dinero gastado en suscripciones de software basado en la nube.
*   **SaaS Bloat (Proliferación de SaaS)**: Crecimiento desmedido y descontrolado de la cantidad de suscripciones de software activas dentro de una empresa, resultando en ineficiencia de costos y complejidad en la gestión.
*   **Runway**: Tiempo que le queda a una empresa antes de quedarse sin caja, calculado en meses dividiendo el saldo de caja actual entre la tasa de consumo de caja mensual (Burn Rate).
*   **Burn Rate (Tasa de Consumo)**: Velocidad a la que una empresa gasta su capital de reserva antes de generar un flujo de caja operativo positivo, generalmente medida sobre una base mensual.
*   **Success Fee (Tarifa de Éxito)**: Modelo de monetización donde el cobro del servicio está indexado directamente a los resultados positivos reales obtenidos por el cliente (en el caso de Onniik, un 10% del ahorro neto facturado en suscripciones canceladas o reasignadas).
*   **ROI de Ahorro Medio (Average Savings ROI)**: Retorno de inversión medio que experimentan los clientes de Onniik, calculado como la relación entre los ahorros netos logrados menos el costo de la suscripción y tarifas pagadas a Onniik.
*   **AARRR Metrics (Métricas Piratas)**: Marco de referencia para el análisis de crecimiento de una startup enfocado en cinco etapas del ciclo de vida del usuario: Adquisición, Activación, Retención, Referencia (Referral) e Ingresos (Revenue).

---

## 2. Términos Técnicos y Operativos

*   **Shadow IT (TI en la Sombra)**: Software, aplicaciones, integraciones o servicios de nube adquiridos e instalados por empleados de manera individual o por departamentos sin la aprobación, conocimiento o supervisión del departamento de TI central.
*   **Seat Reclamation (Reclamación de Asientos)**: Proceso de auditoría de licencias que identifica asientos de usuario inactivos o de ex-empleados asignados a herramientas SaaS corporativas, procediendo a cancelarlos o reasignarlos para evitar cobros redundantes.
*   **Orphan License / Orphan Account (Licencia Huérfana)**: Cuenta activa en un software de terceros (SaaS) que sigue facturando mensualmente pero cuyo usuario ya no existe o está deshabilitado en el directorio central de empleados de la empresa (ej. Google Workspace).
*   **Tool Redundancy (Duplicidad de Herramientas)**: Coexistencia en una organización de dos o más herramientas de software que cubren la misma función o categoría de negocio, incrementando el gasto innecesariamente (ej. pagar Zoom y Google Meet Enterprise simultáneamente, o Notion y Confluence).
*   **Human-in-the-Loop (HITL - Humano en el Bucle)**: Modelo de automatización donde la Inteligencia Artificial ejecuta las tareas de análisis y preparación (ej. redacción de un borrador de cancelación), pero requiere de la aprobación y acción explícita de un ser humano (ej. CFO) antes de realizar el envío o cambio definitivo en producción.
*   **OCR (Reconocimiento Óptico de Caracteres)**: Tecnología que permite la digitalización de imágenes o documentos PDF no buscables para convertirlos en texto plano editable que la Inteligencia Artificial pueda procesar y estructurar.
*   **Figma Inactivity Inference (Inferencia de Inactividad en Figma)**: Estrategia de detección de inactividad indirecta para el MVP de Onniik, en la cual el desuso de herramientas de diseño u otras aplicaciones con cobro por asiento se deduce del historial de inicios de sesión SSO y la actividad general de la cuenta corporativa, en lugar de consultar APIs directas del proveedor de SaaS (las cuales están fuera del alcance del MVP).

---

## 3. Términos de Seguridad e Identidades

*   **OAuth (Open Authorization)**: Protocolo de seguridad estándar de la industria que permite a aplicaciones de terceros (como Onniik) acceder de forma segura y limitada a los recursos del usuario (ej. directorio de usuarios o canales de Slack) sin que este tenga que revelar sus contraseñas.
*   **SSO (Single Sign-On / Inicio de Sesión Único)**: Esquema de autenticación centralizada que permite a los usuarios iniciar sesión con una única identidad digital (ej. cuenta de Google Workspace corporativa) a múltiples plataformas secundarias.
*   **Google SSO / Login**: Flujo de inicio de sesión exclusivo para el MVP de Onniik, eliminando la necesidad de contraseñas de usuario locales y sus riesgos asociados de seguridad. También se utiliza de forma pasiva para mapear a qué herramientas acceden los empleados mediante el SSO corporativo.
*   **RBAC (Role-Based Access Control - Control de Acceso Basado en Roles)**: Método para regular el acceso a los recursos del sistema en base a los roles de los usuarios individuales en la organización (en Onniik: Administrador/CFO, IT Manager, y Reader).
*   **AES-256-GCM**: Algoritmo de cifrado simétrico robusto de grado militar con clave de 256 bits y modo Galois/Counter Mode que proporciona confidencialidad y verificación de integridad. Utilizado por Onniik para encriptar los tokens de Google Workspace y Slack en reposo dentro de PostgreSQL.

---

## 4. Términos de Infraestructura y Calidad

*   **Lighthouse**: Herramienta de auditoría automática desarrollada por Google que analiza el rendimiento, la accesibilidad, las buenas prácticas y el posicionamiento SEO de las aplicaciones web.
*   **Blue-Green Deployment (Despliegue Azul-Verde)**: Estrategia de entrega continua sin tiempo de inactividad que utiliza dos entornos de producción idénticos (el activo "Azul" y el inactivo "Verde") para realizar actualizaciones seguras redirigiendo el tráfico del enrutador.
