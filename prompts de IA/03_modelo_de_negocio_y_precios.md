# Modelo de Negocio y Estructura Financiera: Onniik

Este documento establece el modelo de monetización, la estructura de costos de infraestructura cloud e inteligencia artificial (IA), y el análisis de márgenes operativos para Onniik.

---

## 1. Niveles de Precios (Pricing Tiers)

Onniik utiliza un modelo híbrido **Freemium + Tarifa de Éxito (Success Fee)** diseñado para eliminar la fricción de entrada y alinear los ingresos de la plataforma con el valor real aportado al cliente.

### A. Plan Free (Auditoría de Entrada)
*   **Costo**: $0 USD / mes.
*   **Límite de Gasto Auditable**: Hasta $5,000 USD de gasto mensual en SaaS.
*   **Funcionalidades Incluidas**:
    *   Conexión OAuth de Google Workspace y Slack (auditoría pasiva inicial).
    *   Dashboard de control financiero con visualización de herramientas detectadas.
    *   Alertas básicas de duplicidad de software y Shadow IT en la web.
    *   *Limitación*: No permite la ejecución del agente de IA para cancelaciones autónomas, ni tiene soporte para facturas PDF vía OCR.

### B. Plan Pro (SaaS Optimizado)
*   **Costo**: $99 USD / mes + **10% de tarifa de éxito** sobre los ahorros netos reales generados durante los primeros 12 meses de cada recomendación aplicada.
*   **Límite de Gasto Auditable**: Hasta $50,000 USD de gasto mensual en SaaS.
*   **Funcionalidades Incluidas**:
    *   Sincronización continua de uso e inactividad en background (cada 24h).
    *   Auditoría ilimitada de facturas PDF por buzón de correo o carga manual mediante OCR.
    *   Recomendaciones automáticas de reducción de licencias ("Seat Reclamation").
    *   **Onniik Bot (Agente de IA)**: Redacción automatizada de correos de cancelación y negociación de precios.
    *   Integraciones directas vía API con proveedores clave (ej. Figma, HubSpot, GitHub, Zoom) para análisis detallado de uso.
    *   Alertas en canales de Slack.

### C. Plan Enterprise (Escala Corporativa)
*   **Costo**: Cotización personalizada (SaaS base) + 10% de tarifa de éxito sobre ahorros netos.
*   **Límite de Gasto Auditable**: Más de $50,000 USD de gasto mensual en SaaS.
*   **Funcionalidades Incluidas**:
    *   Todo lo del Plan Pro.
    *   Soporte Multi-Tenant y control de múltiples organizaciones bajo un solo panel matriz.
    *   Integración SSO avanzada (Okta, Azure AD) y con sistemas ERP complejos.
    *   Bots de Slack corporativos personalizados y workflows de aprobación jerárquica para la toma de decisiones.
    *   Políticas de retención de datos personalizadas y cumplimiento estricto de SOC2.
    *   Soporte técnico prioritario y Account Manager dedicado.

---

## 2. Costo de Infraestructura de Inteligencia Artificial (IA)

La principal variable de costo operativo dinámico proviene del procesamiento de lenguaje natural (LLM) a través de APIs de terceros (ej. OpenAI GPT-4o-mini y GPT-4o). A continuación, se detalla la estimación de costos unitarios basados en el volumen de uso real por cliente:

### A. Extracción OCR de Facturas (PDF a JSON estructurado)
*   **Modelo Sugerido**: GPT-4o-mini (excelente rendimiento para extracción estructurada).
*   **Consumo de Tokens por Factura**:
    *   Entrada (Text OCR extraído): ~2,000 tokens.
    *   Salida (JSON con monto, fecha, moneda, proveedor, emisor): ~300 tokens.
*   **Costo por Factura**:
    $$\text{Costo Entrada} = 2,000 \times \frac{\$0.15}{1,000,000} = \$0.00030 \text{ USD}$$
    $$\text{Costo Salida} = 300 \times \frac{\$0.60}{1,000,000} = \$0.00018 \text{ USD}$$
    $$\text{Costo Total por Factura} \approx \$0.00048 \text{ USD}$$
*   **Volumen Estimado**: Un cliente Pro promedio procesa 40 facturas mensuales.
    $$\text{Costo Mensual de Facturas por Cliente} = 40 \times \$0.00048 = \$0.0192 \text{ USD}$$

### B. Motor de Clasificación y Recomendaciones
*   **Modelo Sugerido**: GPT-4o-mini (ejecutado de forma periódica o por disparador).
*   **Consumo de Tokens por Ejecución**: Entrada: 1,500 tokens. Salida: 250 tokens.
*   **Costo por Ejecución**:
    $$\text{Costo por Ejecución} = \left(1,500 \times \frac{\$0.15}{1,000,000}\right) + \left(250 \times \frac{\$0.60}{1,000,000}\right) \approx \$0.00037 \text{ USD}$$
*   **Volumen Estimado**: 30 ejecuciones mensuales (diario).
    $$\text{Costo Mensual de Motor por Cliente} = 30 \times \$0.00037 = \$0.0111 \text{ USD}$$

### C. Redacción del Agente de IA (Cancelaciones y Negociaciones)
*   **Modelo Sugerido**: GPT-4o (mayor razonamiento lógico y redacción formal y persuasiva).
*   **Consumo de Tokens por Draft**: Entrada (contexto de uso, plantilla, datos de facturación): 3,500 tokens. Salida (cuerpo del correo formal): 500 tokens.
*   **Costo por Redacción**:
    $$\text{Costo por Draft} = \left(3,500 \times \frac{\$2.50}{1,000,000}\right) + \left(500 \times \frac{\$10.00}{1,000,000}\right) = \$0.00875 + \$0.00500 = \$0.01375 \text{ USD}$$
*   **Volumen Estimado**: 10 borradores generados al mes por cliente.
    $$\text{Costo Mensual de Redacción por Cliente} = 10 \times \$0.01375 = \$0.1375 \text{ USD}$$

### D. Chat Conversacional Interactivo (Soporte Financiero)
*   **Modelo Sugerido**: GPT-4o-mini (respuestas rápidas y económicas).
*   **Costo por Consulta (Promedio de 5 interacciones por sesión)**: ~$0.0075 USD.
*   **Volumen Estimado**: 4 sesiones de chat mensuales por cliente.
    $$\text{Costo Mensual de Chat por Cliente} = 4 \times \$0.0075 = \$0.0300 \text{ USD}$$

### Resumen de Costo Mensual de IA por Cliente (Pro):
*   Procesamiento de Facturas: $0.0192 USD
*   Motor de Recomendaciones: $0.0111 USD
*   Redacción de Correos (GPT-4o): $0.1375 USD
*   Chat de Soporte IA: $0.0300 USD
*   **Costo Total de IA Estimado por Cliente / Mes**: **$0.1978 USD** (Aproximadamente **$0.20 USD** con margen de variación).

---

## 3. Costo de Infraestructura Cloud General (Escala Inicial)

Para dar servicio a los primeros 100 clientes (fase MVP y Beta), los costos de infraestructura base mensual estimados son:

1.  **Base de Datos PostgreSQL (Gestionada)**: $15.00 USD / mes (ej. Supabase o Neon).
2.  **Redis y BullMQ (Cola y Caché)**: $10.00 USD / mes (ej. Upstash Serverless).
3.  **Servidor de Aplicación Backend (Express/TypeScript)**: $7.00 USD / mes (ej. Render Web Service).
4.  **Hospedaje de Frontend SPA**: $0.00 USD / mes (ej. Vercel o Netlify, capa gratuita).
5.  **Servicios de Envío de Email (Transaccionales)**: $15.00 USD / mes (ej. Postmark o Resend).
*   **Costo Base Cloud Fijo**: **$47.00 USD / mes** (Redondeado a **$50.00 USD**).

---

## 4. Análisis de Márgenes y Viabilidad Económica (Unit Economics)

Asumiendo una base inicial conservadora de **50 clientes activos** en el Plan Pro:

### A. Ingresos Proyectados (Mensual)
*   **Ingreso Fijo (Suscripción)**:
    $$50 \text{ clientes} \times \$99 \text{ USD} = \$4,950 \text{ USD / mes}$$
*   **Ingreso Variable (Tarifa de Éxito)**:
    *   Suposición: Ahorro mensual promedio detectado y aplicado por empresa de $1,200 USD.
    *   Tarifa del 10%: $120 USD mensuales cobrados por empresa.
    *   Ingreso Variable Total:
        $$50 \text{ clientes} \times \$120 \text{ USD} = \$6,000 \text{ USD / mes}$$
*   **Ingresos Totales Brutos**:
    $$\$4,950 \text{ (Fijo)} + \$6,000 \text{ (Tarifa de Éxito)} = \$10,950 \text{ USD / mes}$$

### B. Costos Operativos Totales (Mensual)
*   **Costo Cloud Fijo**: $50.00 USD
*   **Costo de IA Variable**:
    $$50 \text{ clientes} \times \$0.20 \text{ USD} = \$10.00 USD$$
*   **Costos Operativos Totales**:
    $$\$50.00 \text{ (Cloud)} + \$10.00 \text{ (IA)} = \$60.00 \text{ USD / mes}$$

### C. Margen Operativo Bruto
*   **Margen Operativo Bruto**:
    $$\frac{\$10,950 - \$60}{\$10,950} \times 100 \approx \mathbf{99.45\%}$$

Este análisis demuestra que Onniik cuenta con una estructura de costos extremadamente baja, donde el costo variable de procesamiento por IA es insignificante comparado con la suscripción mensual de $99 USD y la tarifa de éxito del 10%. Esto permite reinvertir el capital en la adquisición de clientes y el desarrollo de la plataforma, garantizando la sostenibilidad a largo plazo.
