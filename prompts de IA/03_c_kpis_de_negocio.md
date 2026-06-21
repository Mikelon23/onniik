# KPIs de Negocio: Indicadores y Métricas Financieras

Este documento define la metodología de cálculo, las fórmulas matemáticas y los objetivos de los Indicadores Clave de Rendimiento (KPIs) para Onniik. Dado nuestro modelo híbrido de cobro (suscripción base fija + comisión por éxito), el seguimiento de estas métricas difiere de los modelos SaaS tradicionales.

---

## 1. MRR (Monthly Recurring Revenue - Ingresos Recurrentes Mensuales)

El MRR total de Onniik se compone de dos flujos de ingresos distintos: una parte predecible (suscripción Pro) y una parte variable basada en el rendimiento (Success Fee).

### Fórmula de Cálculo:
$$MRR_{\text{Total}} = MRR_{\text{Fijo}} + MRR_{\text{Variable}}$$

Donde:
*   **$MRR_{\text{Fijo}}$**: Proviene de la tarifa base del Plan Pro ($99 USD al mes).
    $$MRR_{\text{Fijo}} = N_{\text{ClientesPro}} \times 99$$
*   **$MRR_{\text{Variable}}$**: Proviene de la tarifa de éxito del 10% sobre los ahorros mensuales logrados y validados bajo el modelo *Human-in-the-Loop*.
    $$MRR_{\text{Variable}} = \sum_{i=1}^{N_{\text{ClientesPro}}} (\text{AhorroNetoAplicado}_i \times 0.10)$$

### Objetivo de Hito Inicial (50 Clientes Pro):
*   **$MRR_{\text{Fijo}}$**: $4,950 USD.
*   **$MRR_{\text{Variable}}$**: $6,000 USD (asumiendo un ahorro promedio mensual de $1,200 USD por cliente).
*   **Target $MRR_{\text{Total}}$**: **$10,950 USD**.

---

## 2. ARPU (Average Revenue Per User - Ingreso Medio por Cliente)

El ARPU mensual mide el valor promedio de facturación que aporta cada empresa en el Plan Pro.

### Fórmula de Cálculo:
$$ARPU = \frac{MRR_{\text{Total}}}{N_{\text{ClientesPro}}}$$

### Simulación de Escenario Base:
*   Si una startup Pro promedio logra ahorrar $1,200 USD mensuales:
    $$ARPU = 99 + (1,200 \times 0.10) = 99 + 120 = \mathbf{219\text{ USD/mes}}$$

---

## 3. LTV (Lifetime Value - Valor de por Vida del Cliente)

El LTV estima el beneficio neto total que Onniik espera recibir de una cuenta de cliente promedio a lo largo de su ciclo de vida comercial.

### Fórmula de Cálculo:
$$LTV = \frac{ARPU \times \text{MargenBruto}\%}{Churn_{\text{Clientes}}\%}$$

Donde:
*   **Margen Bruto**: Evaluado en **99.45%** según la auditoría de costos de infraestructura y cómputo de IA (documentada en `03_modelo_de_negocio_y_precios.md`).
*   **$Churn_{\text{Clientes}}\%$**: Tasa de cancelación mensual de clientes.

### Proyección Objetivo (Fase Beta / Lanzamiento):
*   Asumiendo un $ARPU$ de $219 USD, un Margen Bruto de 99.45% y un Churn mensual conservador de 6%:
    $$LTV = \frac{219 \times 0.9945}{0.06} \approx \mathbf{3,630\text{ USD}}$$

---

## 4. CAC (Customer Acquisition Cost - Costo de Adquisición de Clientes)

El CAC representa el costo total invertido para convertir a una startup potencial en un cliente del Plan Pro.

### Fórmula de Cálculo:
$$CAC = \frac{\text{Costos de Marketing} + \text{Costos de Ventas}}{\text{Nuevos Clientes Adquiridos}}$$

### Estrategia de Control de CAC (Fase Inicial):
*   Dado el presupuesto inicial ajustado, se priorizarán canales orgánicos y de bajo costo operativo:
    1.  Lanzamiento y SEO orgánico en Product Hunt.
    2.  Prospección directa automatizada en LinkedIn orientada a CFOs y Directores de IT.
    3.  Marketing de contenidos y guías sobre "Cómo eliminar el Shadow IT" y "Herramientas para aprobar SOC2".
*   **Target CAC**: **<$100 USD**.
*   **Relación LTV/CAC Esperada**: **>30:1** (extremadamente saludable debido a los bajos costos de adquisición orgánicos y al ARPU elevado por Success Fee).

---

## 5. Churn Rate (Tasa de Abandono)

Monitorea la pérdida de clientes y de ingresos para asegurar que el valor provisto a largo plazo se mantenga estable.

### A. Logo Churn (Abandono de Clientes)
Mide el porcentaje de cuentas de startups que cancelan el servicio cada mes.
$$Churn_{\text{Clientes}} = \frac{\text{Clientes Perdidos en el Mes}}{\text{Clientes Activos al Inicio del Mes}} \times 100$$
*   **Target Logo Churn**: **<5% mensual**.

### B. Net Revenue Churn (Pérdida de Ingresos Netos)
Mide la fluctuación del MRR debido a cancelaciones o reducciones de categoría (Downgrades) compensada por la expansión de ingresos (Upgrades de planes o incrementos en las tarifas de éxito por nuevos ahorros).
$$NetRevenueChurn = \frac{MRR_{\text{Perdido}} - MRR_{\text{Expansión}}}{MRR_{\text{Inicial}}} \times 100$$
*   **Target Net Revenue Churn**: **Negativo (<0%)**. Esto se logra si el ahorro acumulado por los clientes existentes crece más rápido que las cancelaciones, facturando más por Success Fee.

---

## 6. ROI de Ahorro Medio del Cliente (Average Savings ROI)

Métrica externa orientada a la propuesta de valor del cliente. Muestra cuántos dólares recupera una startup por cada dólar que le paga a Onniik.

### Fórmula de Cálculo:
$$ROI_{\text{Cliente}} = \frac{\text{Ahorro Bruto Mensual} - \text{Costo del Plan Onniik}}{\text{Costo del Plan Onniik}} \times 100$$

Donde:
*   $\text{Costo del Plan Onniik} = 99 + (\text{Ahorro Bruto Mensual} \times 0.10)$

### Ejemplo de Retorno de Inversión del Cliente:
*   Para una startup con un ahorro bruto de $1,200 USD al mes:
    *   Costo Onniik: $99 + $120 = $219 USD.
    *   Ahorro Neto Real: $1,200 - $219 = $981 USD.
    *   $$ROI_{\text{Cliente}} = \frac{981}{219} \times 100 = \mathbf{447.9\%}$$
*   **Target de ROI Mínimo de Ahorro para el Cliente**: **>300%**.
