# Especificaciones de Alta Fidelidad: Detalle de Suscripción y Logs de Actividad

Este documento especifica la maquetación HTML, las propiedades de estilos CSS avanzados y la línea de tiempo de auditoría (Timeline) para construir la pantalla de detalle de una suscripción de SaaS individual en Onniik (`/subscriptions/:id`).

---

## 1. Maquetación HTML de la Vista Detalle

La vista se divide en una cabecera de resumen, widgets de métricas rápidas y una cuadrícula de dos columnas asimétricas para los detalles y logs:

```html
<div class="subscription-detail-container">
  <!-- Cabecera de Suscripción -->
  <header class="sub-detail-header glass-card">
    <div class="sub-info-block">
      <span class="sub-logo">[Icono Figma]</span>
      <div>
        <h1>Figma Professional</h1>
        <p class="sub-meta">Categoría: Diseño & Prototipado | Proveedor: Figma Inc.</p>
      </div>
    </div>
    <div class="sub-action-block">
      <button class="btn btn-outline btn-danger-outline">Desvincular Suscripción</button>
    </div>
  </header>

  <!-- Widgets de Métricas Rápidas -->
  <div class="sub-metrics-grid">
    <div class="kpi-card glass-card">
      <span class="kpi-title">Costo Mensual (MRR)</span>
      <div class="kpi-value">$450.00 <span class="currency">USD</span></div>
    </div>
    <div class="kpi-card glass-card">
      <span class="kpi-title">Asientos Auditados</span>
      <div class="kpi-value">30 <span class="currency">Licencias</span></div>
    </div>
    <div class="kpi-card glass-card">
      <span class="kpi-title">Ahorro Potencial</span>
      <div class="kpi-value text-gradient">$75.00 <span class="currency">USD</span></div>
    </div>
  </div>

  <!-- Cuadrícula Principal (2 Columnas) -->
  <div class="sub-detail-grid">
    <!-- Columna Izquierda: Información de Asientos y Facturas -->
    <div class="sub-left-column">
      <div class="detail-section glass-card">
        <h3>Licencias e Integrantes</h3>
        <ul class="user-list">
          <li class="user-item">
            <span class="user-avatar">JD</span>
            <div class="user-info">
              <span class="user-name">John Doe</span>
              <span class="user-email">john@company.com</span>
            </div>
            <span class="badge badge-success">Activo</span>
          </li>
          <li class="user-item">
            <span class="user-avatar">AM</span>
            <div class="user-info">
              <span class="user-name">Ana Martínez</span>
              <span class="user-email">ana@company.com</span>
            </div>
            <span class="badge badge-danger">Inactivo</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Columna Derecha: Logs de Actividad (Timeline) -->
    <div class="sub-right-column">
      <div class="detail-section glass-card">
        <h3>Historial de Auditoría (Logs)</h3>
        
        <div class="timeline">
          <!-- Item de Línea de Tiempo 1 -->
          <div class="timeline-item">
            <div class="timeline-line"></div>
            <div class="timeline-dot dot-cyan"></div>
            <div class="timeline-content">
              <span class="timeline-date">Hoy, 09:30 AM</span>
              <h4 class="timeline-title">Factura procesada con éxito</h4>
              <p class="timeline-desc">OCR procesó la factura de Junio 2026. Importe extraído: $450 USD.</p>
            </div>
          </div>
          <!-- Item de Línea de Tiempo 2 -->
          <div class="timeline-item">
            <div class="timeline-line"></div>
            <div class="timeline-dot dot-amber"></div>
            <div class="timeline-content">
              <span class="timeline-date">18 Jun 2026</span>
              <h4 class="timeline-title">Licencia inactiva identificada</h4>
              <p class="timeline-desc">Se identificó inactividad prolongada en la cuenta de Ana Martínez (Figma).</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS de la Línea de Tiempo y Detalle

Estilos para dar el aspecto premium y construir la estructura visual del timeline:

```css
/* --- Cabecera y Retícula --- */
.sub-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.sub-info-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.sub-logo {
  font-size: 32px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: var(--radius-md);
}

.sub-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.sub-detail-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--spacing-lg);
}

@media (max-width: 992px) {
  .sub-metrics-grid {
    grid-template-columns: 1fr;
  }
  .sub-detail-grid {
    grid-template-columns: 1fr;
  }
}

/* --- Lista de Usuarios --- */
.user-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.user-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
}

.user-email {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}

/* --- Componente Timeline (Línea de Tiempo) --- */
.timeline {
  margin-top: var(--spacing-lg);
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  padding-bottom: var(--spacing-lg);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  top: 6px;
  left: -11px;
  bottom: 0;
  width: 2px;
  background-color: var(--border-color);
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-dot {
  position: absolute;
  top: 6px;
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  z-index: 1;
}

.dot-cyan { background-color: var(--accent-cyan); box-shadow: 0 0 8px var(--accent-cyan); }
.dot-amber { background-color: var(--accent-amber); box-shadow: 0 0 8px var(--accent-amber); }
.dot-red { background-color: var(--accent-red); box-shadow: 0 0 8px var(--accent-red); }

.timeline-content {
  font-family: var(--font-body);
}

.timeline-date {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 2px;
}

.timeline-title {
  font-family: var(--font-title);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.timeline-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* --- Botón Destructivo Especial --- */
.btn-danger-outline {
  border-color: rgba(255, 59, 48, 0.4);
  color: var(--accent-red);
}

.btn-danger-outline:hover {
  background-color: rgba(255, 59, 48, 0.08);
  border-color: var(--accent-red);
}
```
