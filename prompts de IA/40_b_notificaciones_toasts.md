# Especificaciones de Alta Fidelidad: Notificaciones en Tiempo Real (Toasts)

Este documento especifica la maquetación HTML, los colores semánticos y las propiedades de animación CSS para construir el sistema de notificaciones flotantes en tiempo real (Toasts) de Onniik.

---

## 1. Maquetación HTML del Contenedor y Estados de Notificación

Las notificaciones flotantes se renderizan dentro de un contenedor fijo posicionado en la esquina superior derecha del ruteo privado de la aplicación:

```html
<!-- Contenedor general de la pila de Toasts -->
<div class="toast-stack" id="toast-container" aria-live="polite">
  
  <!-- 1. Toast de Éxito (Sincronización completada) -->
  <div class="toast-card glass-card toast-success" role="status">
    <div class="toast-indicator"></div>
    <div class="toast-body">
      <span class="toast-icon">✓</span>
      <div class="toast-text-block">
        <h4 class="toast-title">Conexión exitosa</h4>
        <p class="toast-desc">Se sincronizó el directorio de Google Workspace con Onniik.</p>
      </div>
    </div>
    <button class="toast-close-btn" aria-label="Cerrar notificación">&times;</button>
  </div>

  <!-- 2. Toast de Advertencia (Shadow IT detectado) -->
  <div class="toast-card glass-card toast-warning" role="status">
    <div class="toast-indicator"></div>
    <div class="toast-body">
      <span class="toast-icon">⚠</span>
      <div class="toast-text-block">
        <h4 class="toast-title">Shadow IT detectado</h4>
        <p class="toast-desc">Identificada una cuenta inusual de Figma sin autorizar.</p>
      </div>
    </div>
    <button class="toast-close-btn" aria-label="Cerrar notificación">&times;</button>
  </div>

  <!-- 3. Toast de Error (Fallo de conexión OAuth) -->
  <div class="toast-card glass-card toast-danger" role="status">
    <div class="toast-indicator"></div>
    <div class="toast-body">
      <span class="toast-icon">✗</span>
      <div class="toast-text-block">
        <h4 class="toast-title">Fallo de conexión</h4>
        <p class="toast-desc">No se pudo autenticar con la API de Slack. Reintenta.</p>
      </div>
    </div>
    <button class="toast-close-btn" aria-label="Cerrar notificación">&times;</button>
  </div>

</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Estilos avanzados para controlar el posicionamiento flotante, el resalte de color lateral y las transiciones fluidas de entrada:

```css
/* --- Contenedor de Toasts (Pila) --- */
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 360px;
  width: 90%;
  pointer-events: none; /* Permite clicks debajo de la pila si está vacía */
}

/* --- Tarjeta Toast General --- */
.toast-card {
  pointer-events: auto; /* Restablece interactividad para los Toasts activos */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  animation: toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

/* Barra lateral indicadora de color semántico */
.toast-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
}

.toast-body {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.toast-icon {
  font-size: 16px;
  font-weight: 700;
  margin-top: 2px;
}

.toast-text-block {
  display: flex;
  flex-direction: column;
}

.toast-title {
  font-family: var(--font-title);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.toast-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 1px;
}

.toast-close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: var(--spacing-sm);
  transition: color 0.2s ease;
}

.toast-close-btn:hover {
  color: var(--text-primary);
}

/* --- Estados Semánticos --- */
.toast-success .toast-indicator { background-color: var(--accent-cyan); }
.toast-success .toast-icon { color: var(--accent-cyan); }

.toast-warning .toast-indicator { background-color: var(--accent-amber); }
.toast-warning .toast-icon { color: var(--accent-amber); }

.toast-danger .toast-indicator { background-color: var(--accent-red); }
.toast-danger .toast-icon { color: var(--accent-red); }

/* --- Animación de Entrada (Keyframes) --- */
@keyframes toast-slide-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Clase de Salida (Fade-Out) gatillada por JS */
.toast-card.fade-out {
  transform: scale(0.9);
  opacity: 0;
}
```

---

## 3. Pautas de Ciclo de Vida e Interactividad de Notificaciones

*   **Auto-Dismiss (Ocultamiento automático)**: Los toasts de Éxito e Info deben cerrarse de forma automática transcurridos **5 segundos** mediante la adición de la clase `.fade-out` y posterior eliminación del DOM en JS.
*   **Permanencia en Errores**: Las notificaciones con la clase `.toast-danger` (Errores críticos) no deben contar con temporizador de auto-ocultamiento. Deben permanecer visibles hasta que el CFO presione explícitamente el botón de cierre `.toast-close-btn`.
*   **Accesibilidad ARIA**: Se debe aplicar la propiedad `aria-live="polite"` al contenedor principal `.toast-stack` para asegurar que los lectores de pantalla anuncien los mensajes de forma fluida sin interrumpir las acciones del usuario.
