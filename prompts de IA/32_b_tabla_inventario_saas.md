# Especificaciones de Alta Fidelidad: Tabla de Inventario de SaaS

Este documento especifica la maquetación HTML, los selectores de filtrado y las propiedades avanzadas de estilos CSS para construir la tabla interactiva de inventario de software de Onniik, asegurando un control granular sobre las herramientas asignadas.

---

## 1. Maquetación HTML de la Barra de Filtros y Tabla

El layout agrupa los controles interactivos de búsqueda en la parte superior y envuelve la tabla en un contenedor con soporte para desplazamiento lateral responsivo:

```html
<div class="inventory-container glass-card">
  <!-- Fila de Controles y Filtros -->
  <div class="filter-bar">
    <div class="search-input-wrapper">
      <input type="text" class="form-input" placeholder="Buscar software o proveedor..." aria-label="Buscar software">
    </div>
    <div class="filter-dropdowns">
      <select class="form-select" aria-label="Filtrar por Departamento">
        <option value="">Todos los departamentos</option>
        <option value="engineering">Ingeniería</option>
        <option value="design">Diseño</option>
        <option value="marketing">Marketing</option>
      </select>
      <select class="form-select" aria-label="Filtrar por Nivel de Uso">
        <option value="">Cualquier nivel de uso</option>
        <option value="high">Uso Alto</option>
        <option value="low">Uso Bajo</option>
        <option value="inactive">Inactivo</option>
      </select>
    </div>
  </div>

  <!-- Contenedor Scrollable de la Tabla -->
  <div class="table-responsive-wrapper">
    <table class="inventory-table">
      <thead>
        <tr>
          <th>Software</th>
          <th>Departamento</th>
          <th>Costo Mensual</th>
          <th>Nivel de Uso</th>
          <th>Última Sincronización</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="software-cell">
              <span class="software-icon">[Icono]</span>
              <div class="software-info">
                <span class="software-name">Jira Software</span>
                <span class="software-provider">Atlassian</span>
              </div>
            </div>
          </td>
          <td>Ingeniería</td>
          <td class="amount-cell">$320.00 <span class="currency">USD</span></td>
          <td><span class="badge badge-warning">Uso Bajo (12%)</span></td>
          <td>Hoy, 10:15 AM</td>
          <td class="text-right">
            <button class="btn btn-outline btn-sm">Auditar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Los estilos aplican Glassmorphism y diferencian los niveles de utilización usando variables semánticas:

```css
/* --- Barra de Filtros --- */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 1;
  min-width: 250px;
}

.filter-dropdowns {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

/* --- Controles de Entrada (Inputs/Selects) --- */
.form-input, .form-select {
  background-color: rgba(14, 21, 41, 0.6);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  height: 40px;
  padding: 0 var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s ease;
  width: 100%;
}

.form-input:focus, .form-select:focus {
  border-color: var(--accent-cyan);
  outline: none;
}

.form-select {
  cursor: pointer;
  min-width: 180px;
}

/* --- Tabla de Inventario --- */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.inventory-table th, .inventory-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-body);
  font-size: 14px;
}

.inventory-table th {
  font-family: var(--font-title);
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
}

.inventory-table tbody tr {
  transition: background-color 0.2s ease;
}

.inventory-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

/* --- Celdas Especiales --- */
.software-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.software-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.software-provider {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}

.amount-cell {
  font-family: var(--font-title);
  font-weight: 500;
  color: var(--text-primary);
}

/* --- Badges de Nivel de Uso --- */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-success {
  background-color: rgba(0, 240, 255, 0.08); /* Cian */
  color: var(--accent-cyan);
}

.badge-warning {
  background-color: rgba(255, 184, 0, 0.08); /* Ámbar */
  color: var(--accent-amber);
}

.badge-danger {
  background-color: rgba(255, 59, 48, 0.08); /* Rojo */
  color: var(--accent-red);
}

.text-right { text-align: right; }
.btn-sm { height: 32px; font-size: 12px; padding: 0 var(--spacing-md); }
```

---

## 3. Comportamiento en Dispositivos Móviles

*   **Scroll Horizontal**: El componente `.table-responsive-wrapper` evita desbordamientos de pantalla en resoluciones inferiores a 768px. Se renderiza un gradiente radial sutil en los bordes izquierdo/derecho del contenedor para indicar visualmente que hay más columnas al deslizar.
