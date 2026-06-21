# Embudo de Captación de Usuarios: Marco de Métricas AARRR

Este documento define la estrategia de crecimiento y el embudo de conversión de Onniik, adaptando la metodología **AARRR** (Adquisición, Activación, Retención, Referidos y Monetización) a las necesidades específicas de nuestro modelo híbrido orientado a CFOs y directores de TI.

---

## 1. Mapeo del Embudo AARRR de Onniik

```mermaid
funnel
    title Embudo AARRR de Onniik
    Adquisición : Tráfico Web de Landing Page
    Activación : Conexión OAuth de Google Workspace (Momento Aha!)
    Retención : Apertura de Alertas e Informes Semanales
    Monetización : Upgrade a Plan Pro / Envío de Cancelación por IA
    Referidos : Recomendación CFO-to-CFO con descuento
```

### A. Adquisición (Acquisition)
*   **Público Objetivo**: CFOs, Controllers Financieros, Directores de Operaciones y Directores de TI en startups y scaleups de LatAm.
*   **Canales Clave**:
    1.  **Outbound Directo (LinkedIn)**: Campañas dirigidas a tomadores de decisiones que manejan presupuestos operativos (OpEx).
    2.  **Marketing de Contenidos Financieros**: Publicaciones sobre el desperdicio real de SaaS corporativo (ej. *"¿Cómo Slack te está cobrando $1,200 USD de más por ex-empleados?"*).
    3.  **Integraciones de Landing Page**: Calculadora interactiva y gratuita de "Desperdicio SaaS estimado" basada en la cantidad de empleados declarada.
*   **Métrica Clave**: Visitas a la Landing Page, Tasa de Clics (CTR) y Tasa de Registro Inicial (Signups via Google SSO).

---

### B. Activación (Activation) - El Momento "Aha!"
*   **Definición**: El momento de activación ocurre cuando el usuario conecta su cuenta de Google Workspace en el Onboarding y visualiza su primer **monto de ahorro real o potencial** en el Dashboard en menos de 5 minutos.
*   **Iniciativas de Growth**:
    1.  **Onboarding de 3 clics**: Sin formularios largos. Inicio de sesión mediante Google SSO, selección de Scopes, y entrada automática al Dashboard.
    2.  **Visualización Inmediata**: Mientras el motor OCR y las APIs analizan datos de fondo, el dashboard debe poblarse dinámicamente con las primeras alertas detectadas (ej. *"Se detectaron 3 ex-empleados con correos inactivos"*).
*   **Métrica Clave**: % de usuarios registrados que completan la vinculación técnica de Google Workspace e integran al menos un canal adicional (Slack o subida manual de facturas) en las primeras 24 horas.

---

### C. Retención (Retention)
*   **Definición**: Un cliente retenido en Onniik es aquel que continúa manteniendo sus integraciones conectadas y revisa periódicamente las notificaciones financieras.
*   **Iniciativas de Growth**:
    1.  **Reporte Semanal (CFO Digest)**: Correo transaccional corto los lunes por la mañana con el gasto consolidado y el ROI acumulado.
    2.  **Alertas de Shadow IT en Slack**: Canal directo de alertas que notifica al equipo de TI en tiempo real cuando se instala un software no homologado.
    3.  **Auditoría de Inactividad Mensual**: Automatización que recuerda los fines de mes qué cuentas deben cancelarse para evitar la renovación de ciclos de cobro.
*   **Métrica Clave**: Tasa de Apertura de Reportes Semanales (Open Rate > 45%), Tasa de Retención de Conexión OAuth (API Connection Retention), Churn de Integración.

---

### D. Referidos (Referral)
*   **Definición**: El crecimiento orgánico apalancado en redes de CFOs de startups. Los CFOs suelen confiar en recomendaciones de sus pares para herramientas que leen datos de Gmail y Workspace.
*   **Iniciativas de Growth**:
    1.  **Programa de Incentivos CFO-to-CFO**: La startup referida recibe un crédito de $100 USD en sus primeras comisiones de éxito. La startup referente recibe un 50% de descuento en la renta del plan Pro del mes siguiente.
    2.  **Shareable ROI**: Permitir descargar un reporte en PDF de ahorros logrados (ej. *"Hemos ahorrado $5,200 USD con Onniik"*) diseñado específicamente para que los CFOs lo compartan en sus juntas de consejo directivo (Board Meetings) o redes profesionales.
*   **Métrica Clave**: Factor Viral ($K$-factor), % de nuevos registros provenientes de códigos de referido.

---

### E. Monetización (Revenue)
*   **Definición**: La transición exitosa de un usuario Free a un plan de pago Pro y el cobro de la comisión del 10% por los ahorros logrados.
*   **Iniciativas de Growth**:
    1.  **Límite de Auditoría (Gating)**: El Plan Free limita la auditoría a un gasto mensual acumulado de $5,000 USD. Al superarlo, la plataforma solicita actualizar a Pro para seguir escaneando.
    2.  **Bloqueo de Acción (Feature Gating)**: El Plan Free muestra las alertas de licencias inactivas o huérfanas pero bloquea la descarga de borradores de cancelación y el envío automatizado por el Onniik Copilot. Para habilitarlos, es obligatorio ingresar una tarjeta de crédito Pro.
*   **Métrica Clave**: Conversión de Free a Pro (Objetivo: > 3.5%), Ingresos Mensuales Recurrentes totales ($MRR_{\text{Total}}$), Ingresos por Tarifa de Éxito ($MRR_{\text{Variable}}$).

---

## 2. Matriz de Seguimiento del Funnel de Growth

| Fase del Embudo | Iniciativa Técnica / Growth | Métricas Clave (KPIs) | Objetivo del MVP |
|---|---|---|---|
| **Adquisición** | Outbound LinkedIn + Landing Page con Calculadora de Desperdicio. | CTR, Conversión Landing-to-Signup. | > 15% Tasa de Registro desde visitas. |
| **Activación** | Conexión OAuth ágil y previsualización de ahorros en < 5 minutos. | Tasa de Conexión de Google Workspace exitosa. | > 80% de activaciones exitosas. |
| **Retención** | CFO Digest semanal y canal de alertas de Shadow IT en Slack. | Open Rate de correo, Sesiones mensuales por usuario. | < 6% Churn mensual de integraciones. |
| **Referencia** | Descarga de PDF de ahorros corporativos y programa de créditos. | % de registros mediante enlaces de referido. | 1 de cada 10 registros provienen de referidos. |
| **Monetización**| Feature gating sobre borradores de correos e importe máximo Free. | Conversión a Pro, Recaudación mensual de comisiones. | > 3.5% de tasa de conversión a plan de pago. |
