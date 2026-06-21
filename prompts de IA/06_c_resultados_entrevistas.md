# Resultados de Entrevistas de Descubrimiento de Clientes

Este informe resume los hallazgos y el análisis de 5 entrevistas simuladas con directores financieros (CFOs, COOs, y líderes de finanzas) en startups de diferentes escalas y rondas de inversión. El objetivo es priorizar los puntos de dolor y refinar el desarrollo del MVP de Onniik.

---

## 1. Perfil de los Entrevistas y Síntesis Corta

### Entrevista 1: Carlos (Fintech pre-seed, 15 empleados)
*   **Contexto**: Empresa con crecimiento inicial y presupuesto limitado.
*   **Dolor Clave**: Falta de tiempo. Él hace la conciliación bancaria los fines de semana. Pierde dinero por no cancelar a tiempo pruebas gratuitas ("free trials").
*   **Recepción de Precios**: El plan por éxito (10%) le parece excelente porque no representa un riesgo para su flujo de caja ajustado.
*   **Seguridad**: Baja resistencia. Conectaría Google/Slack inmediatamente si eso le ahorra $200 USD al mes.

### Entrevista 2: Sofía (SaaS B2B Series A, 55 empleados)
*   **Contexto**: Crecimiento de nómina acelerado.
*   **Dolor Clave**: Cuentas de ex-empleados que siguen cobrándose (ej. Jira, HubSpot). Falta de control sobre qué herramientas compran los departamentos por separado.
*   **Recepción de Precios**: Pagaría $99/mes + 10% de éxito si Onniik detecta y cancela de forma autónoma el "gasto hormiga".
*   **Seguridad**: Interés moderado. Requeriría revisar la política de privacidad de Onniik, especialmente sobre el acceso al buzón de facturas de Gmail.

### Entrevista 3: Alejandro (E-commerce Series B, 180 empleados)
*   **Contexto**: Estructura de IT y finanzas formalizada.
*   **Dolor Clave**: Licencias inactivas de herramientas caras (Salesforce y HubSpot). Duplicidad de software (usan Zoom y Google Meet al mismo tiempo).
*   **Recepción de Precios**: Prefiere un fee SaaS mensual fijo. Una comisión del 10% del ahorro sobre $15,000 USD de ahorro al mes sería demasiado costosa. Esto valida que para empresas de este tamaño, el plan Enterprise con tarifa base a medida es imprescindible.
*   **Seguridad**: Alta resistencia. Exige firma de NDA, cifrado de datos en reposo y tránsito (AES-256) y validación de SOC2.

### Entrevista 4: Mariana (EdTech bootstrapped, 30 empleados)
*   **Contexto**: Auto-financiados con márgenes operativos ajustados.
*   **Dolor Clave**: Shadow IT descontrolado. Los diseñadores y programadores compran herramientas con tarjetas corporativas sin pasar por aprobación centralizada.
*   **Recepción de Precios**: Le encanta el plan Freemium para auditar inicialmente, y migraría a Pro bajo modelo por éxito.
*   **Seguridad**: Resistencia media. Acepta si se garantiza que Onniik solo escanea correos con patrones de "invoice" o "receipt".

### Entrevista 5: David (PropTech Series A, 90 empleados)
*   **Contexto**: Múltiples oficinas.
*   **Dolor Clave**: Redundancias funcionales (Notion + Confluence; Slack + Teams). Los jefes de equipo no reportan el desuso de las licencias.
*   **Recepción de Precios**: Cómodo con el plan Pro de $99/mes + success fee.
*   **Seguridad**: Exige que la IA no envíe correos autónomamente sin control humano (Human-in-the-loop). Debe poder revisar el borrador primero.

---

## 2. Matriz de Priorización de Dolores (Prioritized Pain Points)

Con base en las entrevistas, se listan y priorizan los dolores de software de mayor a menor impacto:

| Prioridad | Dolor Identificado | Frecuencia | Impacto Financiero | Viabilidad de Solución en MVP |
|---|---|---|---|---|
| **1 (Crítico)** | Cuentas activas cobrándose por ex-empleados (Offboarding roto). | Muy Alta | Alto | **Alta**: Integrando Google Directory + logs de accesos OAuth. |
| **2 (Alto)** | Asientos/licencias inactivas en SaaS caros (HubSpot, Jira, Figma). | Alta | Alto | **Alta**: Cruce de actividad de APIs directas de SaaS. |
| **3 (Alto)** | Shadow IT e integraciones de Slack no autorizadas ni seguras. | Alta | Medio | **Media**: Monitoreo de integraciones de Slack OAuth. |
| **4 (Medio)** | Duplicidad de herramientas del mismo tipo (Zoom vs. Meet). | Media | Medio | **Baja**: Clasificación semántica de categorías de SaaS por IA. |
| **5 (Bajo)** | Renovaciones automáticas de contratos anuales sin previo aviso. | Baja | Alto | **Media**: Escaneo de fechas de vencimiento en facturas. |

---

## 3. Conclusiones y Ajustes para el MVP de Onniik

1.  **Validación del Enfoque "Human-in-the-Loop"**: Todos los CFOs rechazan el envío de correos 100% autónomo por la IA por temor a errores de redacción o malentendidos con proveedores estratégicos. **Acción**: Es obligatorio implementar la vista de aprobación donde el CFO valida y edita el borrador antes de enviarlo.
2.  **Validación de Modelos de Pago**: El modelo de 10% de éxito es excelente para startups pequeñas (Seed, Pre-seed) para reducir la fricción inicial, pero a escala Series B+, los directores prefieren tarifas planas para evitar "pagar de más" cuando el ahorro es masivo. **Acción**: Diseñar el Plan Enterprise con fee plano a medida desde la estructura comercial inicial.
3.  **Seguridad como Funcionalidad de Negocio**: Para vender a empresas con más de 50 empleados, Onniik debe poder demostrar que:
    *   No guarda el cuerpo de los correos que no sean facturas.
    *   Encripta los tokens de Slack/Google (AES-256).
    *   Se limita a leer metadatos de las facturas (OCR local o procesado efímero de IA).
