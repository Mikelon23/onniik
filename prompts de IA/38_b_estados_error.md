# Especificaciones de Alta Fidelidad: Estados de Error y Excepción

Este documento especifica la maquetación HTML y las propiedades CSS avanzadas para construir los estados de error del sistema (Páginas 404 y 500), el banner de pérdida de conexión y el modal de token expirado de Onniik.

---

## 1. Maquetación HTML de las Vistas y Modales de Error

Se estructuran las vistas de pantalla completa para errores de servidor/ruteo, el banner persistente para pérdida de red y el modal de renovación de credenciales:

```html
<!-- 1. Pantalla de Error General (Utilizada para 404 y 500) -->
<div class="error-screen-container">
  <div class="error-card glass-card">
    <div class="error-icon-wrapper text-gradient-red">[!]</div>
    <h1 class="error-code">Error 500</h1>
    <h2 class="error-message">Fallo Inesperado del Servidor</h2>
    <p class="error-desc">Ocurrió un error temporal al procesar la auditoría de costos. Por favor, reintenta en unos momentos.</p>
    
    <!-- ID de Seguimiento para Soporte -->
    <div class="error-meta-box">
      <span>Tracking ID:</span>
      <code>err_onniik_9821a8f9</code>
    </div>
    
    <div class="error-actions">
      <button class="btn btn-outline" onclick="window.location.reload()">Reintentar</button>
      <a href="/dashboard" class="btn btn-primary btn-glow">Volver al Dashboard</a>
    </div>
  </div>
</div>

<!-- 2. Banner de Conexión de Red Perdida (Offline Banner) -->
<div class="offline-banner" id="offline-indicator" aria-live="assertive">
  <div class="offline-content">
    <span class="offline-pulse-dot"></span>
    <span class="offline-text">Sin conexión a Internet. Intentando reconectar automáticamente...</span>
  </div>
</div>

<!-- 3. Modal de Sesión Expirada (Token OAuth Vencido) -->
<div class="modal-backdrop open" id="session-timeout-modal" role="dialog" aria-modal="true">
  <div class="modal-content glass-card modal-error-accent">
    <div class="modal-header">
      <h3 class="text-gradient-red">Sesión Expirada</h3>
    </div>
    <div class="modal-body">
      <p>Tu token de autenticación de Google SSO ha vencido por inactividad. Es necesario volver a identificarse para continuar auditando tus suscripciones.</p>
    </div>
    <div class="modal-footer">
      <a href="/login" class="btn btn-primary btn-glow">Iniciar Sesión con Google</a>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Configuración de estilos avanzados para el despliegue visual de los estados de error y efectos dinámicos:

```css
/* --- Pantallas Completas de Error (404/500) --- */
.error-screen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: var(--spacing-lg);
}

.error-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.error-icon-wrapper {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.text-gradient-red {
  background: linear-gradient(135deg, #ff453a 0%, #ff9f0a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-code {
  font-size: 32px;
  font-family: var(--font-title);
  color: var(--text-primary);
}

.error-message {
  font-size: 18px;
  color: var(--text-primary);
}

.error-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.error-meta-box {
  background-color: rgba(255, 69, 58, 0.05);
  border: 1px solid rgba(255, 69, 58, 0.15);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.error-meta-box code {
  color: var(--accent-red);
  font-family: monospace;
}

.error-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* --- Banner Superior Offline --- */
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 159, 10, 0.95); /* Ámbar semitransparente */
  color: var(--bg-primary); /* Contraste oscuro en texto */
  text-align: center;
  padding: 10px var(--spacing-lg);
  font-size: 13px;
  font-weight: 600;
  z-index: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.offline-banner.active {
  transform: translateY(0);
}

.offline-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
}

.offline-pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--bg-primary);
  border-radius: 50%;
  animation: pulse-offline 1.5s infinite;
}

@keyframes pulse-offline {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.9);
    opacity: 1;
  }
}

/* --- Alerta Roja en Modal --- */
.modal-error-accent {
  border-color: rgba(255, 69, 58, 0.4);
  box-shadow: 0 10px 40px rgba(255, 69, 58, 0.08);
}
```

---

## 3. Comportamientos de Recuperabilidad y Feedback

*   **Tracking ID**: La pantalla de Error 500 debe incluir un identificador de seguimiento único generado aleatoriamente en el servidor para facilitar la depuración al equipo de soporte.
*   **Offline Auto-Trigger**: El banner superior de conexión perdida debe activarse mediante JavaScript escuchando los eventos globales `window.addEventListener('offline')` y ocultarse de inmediato al escuchar `window.addEventListener('online')`.
