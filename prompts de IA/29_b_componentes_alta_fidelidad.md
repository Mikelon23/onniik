# Especificaciones de Alta Fidelidad: Tarjetas y Gráficos del Dashboard

Este documento define la maquetación HTML, los bloques de estilos CSS avanzados y la configuración técnica de gráficos interactivos necesarios para construir las tarjetas de resumen y el gráfico de tendencias de Onniik con calidad visual de alta gama.

---

## 1. Tarjetas de KPIs Financieros en Alta Fidelidad

Las tarjetas superiores de resumen utilizan una estructura Glassmorphism con bordes brillantes reactivos al cursor.

### A. Estructura HTML de Tarjeta de KPI:
```html
<div class="kpi-card glass-card">
  <div class="kpi-header">
    <span class="kpi-title">Ahorro Neto Real</span>
    <div class="kpi-icon-wrapper">
      <!-- Icono Lucide: TrendingUp -->
      <svg class="kpi-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>
    </div>
  </div>
  <div class="kpi-value text-gradient">$1,220.00 <span class="currency">USD</span></div>
  <div class="kpi-badge positive">+14.2% este mes</div>
</div>
```

### B. Código CSS de la Tarjeta:
```css
.kpi-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover::before {
  opacity: 1;
}

.kpi-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-color-hover);
  box-shadow: 0 12px 40px rgba(0, 240, 255, 0.08);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-title {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-icon-wrapper {
  color: var(--accent-cyan);
  background: rgba(0, 240, 255, 0.06);
  padding: 8px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon {
  width: 18px;
  height: 18px;
}

.kpi-value {
  font-family: var(--font-title);
  font-size: 32px;
  font-weight: 600;
  margin-top: var(--spacing-sm);
}

.kpi-value .currency {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 400;
}

.kpi-badge {
  font-size: 12px;
  margin-top: var(--spacing-sm);
  display: inline-flex;
  align-items: center;
}

.kpi-badge.positive {
  color: var(--accent-cyan);
}

.kpi-badge.warning {
  color: var(--accent-amber);
}
```

---

## 2. Gráfico de Tendencia de Costos (Configuración Técnica)

El gráfico de barras apiladas se implementa utilizando Chart.js. Para conservar la estética premium, se deshabilitan las cuadrículas agresivas y se personalizan los tooltips.

### Configuración JavaScript para Chart.js:
```javascript
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ahorro Real',
        data: [400, 750, 920, 1100, 1150, 1220],
        backgroundColor: 'rgba(0, 240, 255, 0.85)', // Cian eléctrico Onniik
        borderColor: '#00F0FF',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0',
      },
      {
        label: 'Gasto SaaS',
        data: [4450, 4100, 3930, 3750, 3700, 3630],
        backgroundColor: 'rgba(22, 28, 45, 0.85)', // Card Grey de soporte
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0',
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#8A94A6', // --text-muted
          font: { family: 'Outfit', size: 12 }
        }
      },
      tooltip: {
        enabled: false, // Deshabilitar tooltip por defecto para usar HTML tooltip
        external: customHtmlTooltip
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#8A94A6', font: { family: 'Inter' } }
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#8A94A6', font: { family: 'Inter' } }
      }
    }
  }
};
```

### CSS del Tooltip Externo Personalizado (HTML Tooltip):
```css
#chartjs-tooltip {
  opacity: 0;
  position: absolute;
  background: rgba(14, 21, 41, 0.85); /* Navy oscuro */
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color-hover);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 8px 12px;
  pointer-events: none;
  transition: all 0.15s ease;
  font-family: var(--font-body);
  font-size: 12px;
  box-shadow: var(--shadow-card);
}
```
*   **Detalle Estético**: El dataset de **Ahorro Real** debe usar un degradado lineal (Linear Gradient) en Canvas si es soportado por el framework (`createLinearGradient(0, 0, 0, 400)`) que va desde el color `--accent-cyan` hasta el color `--accent-blue` con opacidad del 80%.
