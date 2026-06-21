# Plan de Contingencia de Negocio: Mitigación de Riesgos y Acciones Operativas

Este plan establece las estrategias de contingencia y los protocolos de respuesta rápida de Onniik ante incidentes financieros, de seguridad, operativos o técnicos que pongan en riesgo la viabilidad comercial y la calidad de la plataforma.

---

## 1. Matriz de Riesgos de Negocio (Risk Matrix)

| ID | Riesgo Identificado | Probabilidad | Impacto | Gatillo (Trigger) | Acción de Contingencia |
|---|---|---|---|---|---|
| **R1** | **Altos costos de procesamiento de IA** (APIs de LLM consumiendo el margen). | Media | Alto | El costo acumulado de la API supera el 10% del ARPU mensual por cliente. | Migrar llamadas secundarias a GPT-4o-mini, cachear facturas en Redis y limitar cargas de PDF mensuales. |
| **R2** | **Baja tasa de conversión** (los usuarios Free no migran al plan Pro). | Alta | Alto | Tasa de conversión de Free a Pro menor al 2% en un periodo de 30 días. | Reducir el límite de auditoría gratuita a $2,500 USD y bloquear (gate) la visualización del bot de cancelación. |
| **R3** | **Restricción de APIs externas** (cambio de políticas en Google/Slack). | Baja | Muy Alto | Google o Slack revocan permisos de lectura de sus APIs o cambian los scopes de seguridad obligatorios. | Habilitar el canal de carga de facturas mediante re-envío automático de correo (forwarding email) y subida manual de CSV. |
| **R4** | **Incidente de seguridad** (compromiso de tokens OAuth en base de datos). | Baja | Crítico | Detección de accesos no autorizados a la base de datos o anomalías en la rotación de credenciales. | Ejecución del protocolo de revocación masiva (Kill-Switch) y rotación inmediata de las llaves maestras de encriptación. |
| **R5** | **Alta tasa de abandono** (Logo Churn mensual superior a las metas). | Media | Alto | Churn mensual de clientes Pro superior al 8% durante dos meses consecutivos. | Implementar encuestas de salida obligatorias, ofrecer tarifas de éxito variables puras (sin base fija) y auditoría manual complementaria. |

---

## 2. Protocolos Detallados de Contingencia

### A. Gestión y Control de Costos de IA (R1)
*   **Monitoreo en Tiempo Real**: El backend registrará el consumo de tokens y costos por cliente mediante tags en las solicitudes HTTP de OpenAI.
*   **Caché Agresivo**: Al subir una factura, el sistema generará un hash SHA-256 del contenido del texto OCR antes de enviarlo a la IA. Si el hash ya existe en la base de datos de esa organización, se retornará el JSON de metadatos almacenado en caché, reduciendo el costo a $0 USD.
*   **Estrategia de Fallback de Modelos**: En caso de picos de uso o incrementos de precios de OpenAI, el sistema conmutará de forma transparente al uso de modelos de código abierto alojados localmente o APIs de menor costo sin degradar la precisión estructurada.

### B. Optimización de la Tasa de Conversión (R2)
*   **Estrategia de "Ahorro Oculto" (Gated Value)**: En el Plan Free, el dashboard mostrará el monto exacto de ahorro potencial detectado (ej., *"Tienes $450 USD de ahorro listos"*), pero mantendrá inhabilitada la generación de borradores de correo por el Onniik Bot. Para ver y usar el link de cancelación, el usuario deberá actualizar al Plan Pro.
*   **Ajuste Dinámico de Límites**: Si el volumen de conversión se estanca, la plataforma reducirá automáticamente el límite de gasto auditable gratuito a $2,500 USD al mes para captar la suscripción de empresas en etapas tempranas pero con volumen de software.

### C. Resiliencia ante Cambios de APIs de Terceros (R3)
*   **Buzón de Facturas por Re-envío (Mail Forwarding)**: Si la API de lectura de correos de Google Workspace es deshabilitada o restringida por políticas de privacidad corporativas, se le proporcionará a la startup una dirección de correo exclusiva de Onniik (ej. `empresa@onniik.mail`) para que re-envíen de forma automatizada o manual sus facturas de SaaS para digitalización.
*   **Importación por Carga de CSV**: Habilitar un importador universal de reportes de facturas descargables desde los paneles de proveedores comunes de tarjetas (Ramp, Brex, Stripe) para mapear los costos recurrentes sin necesidad de integración de red activa.

### D. Protocolo de Aislamiento de Seguridad (Kill-Switch) (R4)
*   **Revocación de Acceso Masivo**: En caso de confirmarse una intrusión o fallo de seguridad en PostgreSQL, el backend activará una rutina que enviará peticiones de revocación de tokens inmediatas a los servidores de OAuth de Google y Slack para todas las organizaciones registradas.
*   **Invalidación y Cierre de Sesión**: Se purgará la base de datos de Redis invalidando de forma instantánea todas las sesiones activas de usuarios y administradores, obligando a una nueva autenticación mediante Google SSO una vez que la base de datos esté asegurada y parcheada.

### E. Mitigación de Pérdida de Clientes (R5)
*   **Ajuste del Plan de Cobro**: Si el cobro fijo de $99 USD/mes genera fricción y cancelaciones por falta de ROI percibido inmediato, se ofrecerá un plan de retención transitorio basado puramente en un **15% de Tarifa de Éxito sin renta mensual fija**. Esto alinea el costo a cero si la plataforma no logra identificar ahorros adicionales.
*   **Auditoría Humana Preventiva**: Ofrecer de forma gratuita una sesión de consultoría de 15 minutos con un analista financiero humano de Onniik a las empresas que presenten intenciones de cancelación de cuenta, garantizando la identificación manual de ahorros ocultos de SaaS.
