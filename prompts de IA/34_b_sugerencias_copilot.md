# Especificaciones de Alta Fidelidad: Buzón de Sugerencias de Optimización

Este documento especifica la maquetación HTML y las propiedades CSS avanzadas para construir el buzón de sugerencias e iniciativas de optimización del Onniik Copilot (`/dashboard/optimizations`), incluyendo el modal interactivo de confirmación humana (HITL).

---

## 1. Maquetación HTML de las Tarjetas y Modal de Aprobación

La vista contiene el feed de tarjetas recomendadas y un modal flotante oculto por defecto que permite previsualizar y editar el correo autogenerado:

```html
<div class="optimizations-container">
  <!-- Cabecera de Optimizaciones -->
  <div class="opt-header">
    <h2>Iniciativas de Ahorro Sugeridas</h2>
    <p class="opt-summary">Tienes <span class="text-gradient">3 sugerencias pendientes</span> que pueden ahorrarte hasta $250.00 USD/mes.</p>
  </div>

  <!-- Feed de Tarjetas de Sugerencia -->
  <div class="opt-feed">
    <div class="opt-card glass-card">
      <div class="opt-card-header">
        <span class="badge-type type-seat">Seat Reclamation</span>
        <span class="opt-impact text-gradient">Ahorro: $75.00 USD/mes</span>
      </div>
      <div class="opt-card-body">
        <h3>Remover 5 licencias inactivas en Figma</h3>
        <p>Se detectaron 5 cuentas con inactividad superior a 45 días (incluye ex-colaboradores).</p>
      </div>
      <div class="opt-card-footer">
        <button class="btn btn-outline" onclick="openIgnoreModal()">Ignorar</button>
        <button class="btn btn-primary" onclick="openHitlModal()">Reclamar Asientos</button>
      </div>
    </div>
  </div>

  <!-- Modal HITL (Intervención Humana - Previsualización de Borrador) -->
  <div class="modal-backdrop" id="hitl-modal" aria-hidden="true" role="dialog">
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3>Revisar Borrador del Copilot</h3>
        <button class="close-btn" aria-label="Cerrar modal">&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">El Copilot redactó el siguiente correo para solicitar la remoción de asientos en el proveedor:</p>
        <div class="draft-preview-box">
          <p><strong>Para:</strong> support@figma.com</p>
          <p><strong>Asunto:</strong> Solicitud de ajuste de licencias de suscripción (Account ID: ON-9821)</p>
          <hr class="draft-divider">
          <div class="draft-body" contenteditable="true">
            Estimado soporte de Figma,
            
            Solicitamos la cancelación de 5 licencias profesionales inactivas bajo nuestro tenant corporativo. Los usuarios son:
            - john@company.com
            - ana@company.com
            
            Agradecemos de antemano el procesamiento de este ajuste para nuestro próximo ciclo de facturación.
            
            Atentamente,
            Admin (Onniik Copilot)
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeHitlModal()">Cancelar</button>
        <button class="btn btn-primary btn-glow">Enviar Correo Ahora</button>
      </div>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS de las Tarjetas y Modal

Estilos avanzados para dar profundidad visual e implementar el comportamiento overlay del modal:

```css
/* --- Contenedor del Feed --- */
.optimizations-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.opt-summary {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 2px;
}

.opt-feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-md);
}

/* --- Tarjeta de Optimización --- */
.opt-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}

.opt-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-cyan);
  box-shadow: 0 12px 30px rgba(0, 240, 255, 0.05);
}

.opt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-type {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-type.type-seat {
  background-color: rgba(47, 105, 255, 0.08); /* Azul Conectado */
  color: var(--accent-blue);
}

.opt-impact {
  font-family: var(--font-title);
  font-size: 12px;
  font-weight: 600;
}

.opt-card-body {
  margin: var(--spacing-md) 0;
}

.opt-card-body h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.opt-card-body p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.4;
}

.opt-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* --- Estilos del Modal HITL (Overlay) --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(5, 8, 16, 0.7); /* Base Navy traslúcida */
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.modal-content {
  max-width: 600px;
  width: 90%;
  border-radius: var(--radius-md);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  padding: var(--spacing-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  margin: var(--spacing-md) 0;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-sm);
}

/* --- Caja de Borrador de Correo --- */
.draft-preview-box {
  background-color: rgba(10, 15, 29, 0.8);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-primary);
}

.draft-divider {
  border: none;
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-sm) 0;
}

.draft-body {
  white-space: pre-line;
  line-height: 1.5;
  outline: none;
  cursor: text;
}

.draft-body:focus {
  border-left: 2px solid var(--accent-cyan);
  padding-left: var(--spacing-xs);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}
```

---

## 3. Pautas de Foco y Accesibilidad en Modales

*   **Atrapamiento de Foco (Focus Trap)**: Al abrirse el modal, el foco del teclado debe pasar directamente al primer botón activo dentro del modal (por ejemplo, el campo de edición `.draft-body` o el botón de confirmación).
*   **Compatibilidad WAI-ARIA**: El backdrop del modal debe recibir la clase `.open` para renderizarse visible. Su atributo `aria-hidden` debe modificarse dinámicamente a `false` al activarse y regresar a `true` al cerrarse.
