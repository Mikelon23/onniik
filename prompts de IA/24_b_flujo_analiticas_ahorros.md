# Flujo de Usuario: Historial de Ahorros y Analíticas Financieras

Este documento especifica la arquitectura de la sección de analíticas e historial de ahorros de Onniik, diseñada para dar visibilidad total al CFO sobre el retorno de inversión (ROI) logrado y justificar de forma auditable la facturación del Success Fee.

---

## 1. Diagrama de Navegación y Flujo de Datos

El recorrido de navegación del usuario para evaluar el desempeño financiero:

```mermaid
graph TD
    Nav[Sidebar Navigation] --> View_Sel{¿Qué vista consultar?}
    View_Sel -->|Dashboard General| Dash[/dashboard]
    View_Sel -->|Historial de Ahorros| Sav[/dashboard/savings]
    
    Sav --> KPI_Block[Widgets de KPIs: Ahorro Total, ROI, Comisiones acumuladas]
    Sav --> Chart_Block[Gráficos Interactivos: Tendencia de Ahorro Mensual]
    Sav --> Table_Block[Tabla de Auditoría: Registro de Acciones Exitosas]
    
    Table_Block --> Click_Doc[Clic en Factura de Conciliación]
    Click_Doc --> Modal_PDF[Modal: Ver PDF de factura y desglose de cobro de Onniik]
```

---

## 2. Estructura y Widgets de la Vista de Analíticas (`/dashboard/savings`)

La pantalla se divide en tres niveles horizontales de información, respetando las jerarquías visuales de Outfit/Inter y Glassmorphism:

### A. Fila de KPIs de Impacto (Resumen de Retorno):
1.  **Ahorro Neto Real Consolidado**: Suma de todos los ahorros logrados de forma efectiva tras confirmarse la reducción en facturas posteriores.
2.  **Retorno de Inversión (ROI) del Cliente**: Relación entre el ahorro logrado y la facturación de Onniik (Fórmula: $\frac{\text{Ahorro Neto Real}}{\text{Costo Pro } + \text{Success Fee}}$).
3.  **Comisiones Acumuladas de Success Fee**: El 10% cobrado sobre los ahorros mensuales logrados por optimización durante los primeros 12 meses.

### B. Gráficos Interactivos (Charts):
*   **Gráfico de Tendencia Mensual (Barras apiladas)**: Eje X (Meses), Eje Y (Monto en USD). Muestra el gasto en SaaS original proyectado en color gris, y la reducción real en color cian para dar peso visual al "congelamiento" de gastos.

### C. Tabla de Auditoría (Savings Audit Table):
Muestra el desglose de cada acción que generó ahorros, permitiendo una conciliación directa:

| Software | Acción de Ahorro Aprobada | Fecha Aprobación | Ahorro Mensual | Comisión (10%) | Estado de Cobro |
|---|---|---|---|---|---|
| Atlassian Jira | Recupearción 1 cuenta ex-empleado | 21/06/2026 | $15 USD | $1.5 USD / mes | Cobrado (Factura #102) |
| Zoom Video | Reducción de plan Enterprise a Pro | 15/05/2026 | $120 USD | $12 USD / mes | Pendiente |

---

## 3. Wireframe Textual del Historial de Ahorros

La pantalla `/dashboard/savings` implementa el efecto Glassmorphism con contornos definidos para mejorar la legibilidad de cifras complejas:

```
+-------------------------------------------------------------------------+
|  Onniik  [Sincronizado]                                     [Soporte]  |
|                                                                         |
|  HISTORIAL DE AHORROS Y ROI                                             |
|  Auditoría y conciliación de optimizaciones financieras                  |
|                                                                         |
|  +-------------------+  +-------------------+  +---------------------+  |
|  | AHORRO REAL NETO  |  |   RETORNO (ROI)   |  | COMISIONES ONNIIK   |  |
|  |   $4,820 USD/año  |  |       4.2x        |  |    $482.00 USD      |  |
|  +-------------------+  +-------------------+  +---------------------+  |
|                                                                         |
|  TENDENCIA DE AHORRO MENSUAL                                            |
|  [ Gráfico de barras apiladas: Gasto original vs Ahorro real cian ]      |
|                                                                         |
|  DETALLE DE ACCIONES DE OPTIMIZACIÓN                                    |
|  +-------------------------------------------------------------------+  |
|  | Software | Acción              | Ahorro  | Com. (10%)| Estado     |  |
|  | Atlassian| Baja cuenta ex-emp. | $15/mes | $1.50/mes | Cobrado    |  |
|  | Notion   | Eliminar Shadow IT  | $40/mes | $4.00/mes | Pendiente  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

*   **Pila Tipográfica**: Cifras monetarias de los widgets y encabezados en tipografía **Outfit** (Semi-bold, color `--accent-cyan`). Tablas y textos de etiquetas en tipografía **Inter** (Regular, `--text-muted`).
*   **Interactividad**: Al pasar el cursor sobre las filas de la tabla de optimizaciones (Hover state), la fila se ilumina con una opacidad del 2% en color blanco (`rgba(255, 255, 255, 0.02)`) y el cursor cambia a tipo puntero (`cursor: pointer`). Al hacer clic, se abre un modal con el desglose de la conciliación del Success Fee mensual del registro seleccionado.
