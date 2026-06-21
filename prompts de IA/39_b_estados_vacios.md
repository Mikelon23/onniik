# Especificaciones de Alta Fidelidad: Estados Vacíos (Empty States)

Este documento especifica la maquetación HTML y las propiedades CSS avanzadas para construir los estados vacíos (Empty States) del Dashboard, Historial de Ahorros e Iniciativas de Optimización de Onniik.

---

## 1. Maquetación HTML de los Estados Vacíos

Se definen tres layouts de marcadores de posición para educar y orientar visualmente al usuario cuando no existen datos:

```html
<!-- Escenario 1: Dashboard sin Integraciones (Primer Ingreso) -->
<div class="empty-state-panel glass-card">
  <div class="empty-icon-box">
    <!-- Icono de Red/Conectores en CSS -->
    <span class="empty-css-icon icon-connect"></span>
  </div>
  <h3>Comienza a auditar tu software</h3>
  <p>Vincula tus directorios corporativos para escanear de forma segura las licencias inactivas e identificar Shadow IT.</p>
  <div class="empty-actions">
    <a href="/dashboard/integrations" class="btn btn-primary btn-glow">Conectar Primera Integración</a>
  </div>
</div>

<!-- Escenario 2: Historial de Ahorros Vacío (Sin Facturas Procesadas) -->
<div class="empty-state-panel glass-card">
  <div class="empty-icon-box">
    <!-- Icono de Factura/Archivo -->
    <span class="empty-css-icon icon-invoice"></span>
  </div>
  <h3>Aún no has registrado facturas</h3>
  <p>Sube tus facturas PDF de Figma, Jira o Google para que nuestra IA estructure tus costos de suscripción.</p>
  
  <!-- Zona de Carga Rápida (Dropzone) Embebida -->
  <div class="mini-dropzone">
    <input type="file" id="invoice-upload" class="hidden-input" aria-label="Subir factura PDF">
    <label for="invoice-upload" class="dropzone-label">
      <span>Arrastra tu archivo aquí o <strong>selecciona un PDF</strong></span>
    </label>
  </div>
</div>

<!-- Escenario 3: Buzón de Optimizaciones Limpio (Todo Optimizado) -->
<div class="empty-state-panel glass-card">
  <div class="empty-icon-box">
    <!-- Icono de Copilot/Check en CSS -->
    <span class="empty-css-icon icon-shield-check"></span>
  </div>
  <h3 class="text-gradient">¡Estás al día!</h3>
  <p>Onniik Copilot analizó tu directorio y no encontró licencias inactivas ni software Shadow IT. Tu presupuesto está completamente optimizado.</p>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Configuración estética de alta fidelidad para el ruteo de elementos Glassmorphism difuminados:

```css
/* --- Contenedor de Estado Vacío --- */
.empty-state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 40px var(--spacing-xl);
  max-width: 540px;
  margin: 40px auto;
  min-height: 300px;
  border-color: rgba(255, 255, 255, 0.05);
}

.empty-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.empty-state-panel h3 {
  font-family: var(--font-title);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.empty-state-panel p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
  max-width: 420px;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* --- Mini Dropzone de Carga Rápida --- */
.mini-dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  background-color: rgba(10, 15, 29, 0.4);
  padding: var(--spacing-md) var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.mini-dropzone:hover {
  border-color: var(--accent-cyan);
  background-color: rgba(0, 240, 255, 0.02);
}

.hidden-input {
  display: none;
}

.dropzone-label {
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
}

.dropzone-label strong {
  color: var(--accent-cyan);
}

/* --- Iconos CSS Sutiles --- */
.empty-css-icon {
  font-size: 24px;
}

.icon-connect::before {
  content: '⚡';
}

.icon-invoice::before {
  content: '📄';
}

.icon-shield-check::before {
  content: '🛡️';
}
```

---

## 3. Pautas de Foco y Accesibilidad

*   **Llamadas a la acción (CTAs)**: Los enlaces interactivos `.btn-primary` y la Dropzone deben ser accesibles por teclado (navegación con tecla `TAB`) y contar con un borde visible de foco de `2px` en color cian eléctrico.
*   **Compatibilidad de Pantalla**: La Dropzone de subida rápida debe contar con un tag `aria-label` para los lectores de pantalla y soporte semántico nativo para selección de archivos.
