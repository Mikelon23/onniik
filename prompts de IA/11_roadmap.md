# Roadmap de Desarrollo: Onniik

El desarrollo se divide en tres fases incrementales para validar rápido el mercado y optimizar recursos.

---

## Fase 1: Producto Mínimo Viable (MVP) - Semanas 1 a 6
*Objetivo: Lograr el Onboarding básico, conectar Slack y Google Workspace de prueba, y generar las primeras 3 alertas de ahorro con IA en un entorno local.*

- **Semana 1-2**: Configuración del entorno de base, diseño del backend core (base de datos relacional y autenticación JWT), y sistema de diseño visual responsivo.
- **Semana 3-4**: Desarrollo de integraciones OAuth básicas de Google Directory y Slack. Mockeo de llamadas externas para agilizar pruebas.
- **Semana 5-6**: Implementación de la extracción de texto de facturas con la API de OpenAI y maquetación de las vistas del Dashboard y Alertas.

---

## Fase 2: Lanzamiento y Estabilización (V1.0) - Semanas 7 a 12
*Objetivo: Integración de punta a punta con usuarios beta reales, procesamiento automático de facturas de Gmail y chat con el Agente de IA.*

- **Semana 7-8**: Conexión de colas BullMQ asíncronas en Redis para sincronización pasiva de datos. Lógica de cálculo de inactividad de usuarios.
- **Semana 9-10**: Asistente virtual por chat conversacional e integración de OCR para facturas PDF. Manejo seguro de contraseñas y encriptado AES-256 de llaves.
- **Semana 11-12**: Pruebas unitarias robustas, test de integración, auditoría de Lighthouse y despliegue del MVP en entorno de staging (Render / AWS).

---

## Fase 3: Escalabilidad y Expansión Enterprise - Semanas 13+
*Objetivo: Redundancia de servicios, integración con más de 50 APIs de SaaS directo (Salesforce, HubSpot, Jira, AWS cost monitor) y monetización.*

- Integración de pasarela de pagos real (Stripe) para cobrar la comisión por éxito y suscripciones.
- Motor de Machine Learning propio para predecir cuándo una suscripción aumentará de precio por uso (Anomaly Detection).
- Soporte Multi-Tenant avanzado con partición física de bases de datos para clientes Enterprise.
