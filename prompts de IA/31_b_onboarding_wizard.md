# Especificaciones de Alta Fidelidad: Onboarding Wizard

Este documento define la maquetación HTML, estilos CSS avanzados y el comportamiento interactivo de la pantalla de bienvenida y onboarding paso a paso de Onniik, asegurando un registro dinámico y veloz.

---

## 1. Maquetación HTML del Asistente de Registro (Multi-step)

El asistente de onboarding utiliza un diseño centrado y modular con un indicador visual de progreso superior (Stepper):

```html
<div class="onboarding-wrapper">
  <!-- Fondo Decorativo (Glow) -->
  <div class="bg-blur-glow" style="top: 10%; left: 10%;"></div>
  <div class="bg-blur-glow" style="bottom: 10%; right: 10%;"></div>

  <div class="onboarding-card glass-card">
    <div class="onboarding-header">
      <h1>Configura tu congelador de costos</h1>
      <p>Conecta tus cuentas y audita tus costos de software en menos de 5 minutos.</p>
    </div>

    <!-- Stepper (Indicador de Progreso) -->
    <div class="stepper">
      <div class="step active">
        <span class="step-num">1</span>
        <span class="step-label">Directorio</span>
      </div>
      <div class="step-line active"></div>
      <div class="step">
        <span class="step-num">2</span>
        <span class="step-label">Slack</span>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <span class="step-num">3</span>
        <span class="step-label">Facturas</span>
      </div>
    </div>

    <!-- Paneles de Contenido (Muestra del Paso Activo) -->
    <div class="step-panel" id="panel-step-1">
      <h3>Paso 1: Sincroniza tu directorio corporativo</h3>
      <p class="panel-desc">Vincula Google Workspace para auditar las cuentas activas de tu equipo y detectar licencias inactivas.</p>
      
      <!-- Botón OAuth Google -->
      <button class="btn btn-oauth btn-google">
        <img class="oauth-logo" src="data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='%234285F4'/><path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='%2334A853'/><path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z' fill='%23FBBC05'/><path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='%23EA4335'/></svg>" alt="Google">
        Conectar Google Workspace
      </button>

      <div class="actions-footer">
        <button class="btn btn-outline" onclick="nextStep()">Omitir paso por ahora</button>
      </div>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Los estilos configuran el stepper y los botones de inicio OAuth integrándolos al tono de Onniik:

```css
/* --- Contenedor Centrado del Wizard --- */
.onboarding-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  position: relative;
  background-color: var(--bg-primary);
}

.onboarding-card {
  max-width: 580px;
  width: 100%;
  text-align: center;
  z-index: 10;
}

.onboarding-header h1 {
  font-size: 28px;
  margin-bottom: var(--spacing-xs);
}

.onboarding-header p {
  color: var(--text-muted);
  font-size: 14px;
}

/* --- Estilos del Stepper --- */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-xl) 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-title);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step.active .step-num {
  background-color: var(--accent-cyan);
  color: var(--bg-primary);
  border-color: var(--accent-cyan);
  box-shadow: var(--glow-cyan);
}

.step-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.step.active .step-label {
  color: var(--text-primary);
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: var(--border-color);
  margin: 0 var(--spacing-md);
  margin-bottom: 20px; /* Alineación con el número */
  transition: background-color 0.3s ease;
}

.step-line.active {
  background-color: var(--accent-cyan);
}

/* --- Botones OAuth Especiales --- */
.btn-oauth {
  width: 100%;
  margin: var(--spacing-lg) 0;
  background: #FFFFFF;
  color: #1F2937;
  font-family: var(--font-body);
  font-weight: 500;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-google:hover {
  background-color: #F9FAFB;
  transform: translateY(-1px);
}

.oauth-logo {
  width: 20px;
  height: 20px;
}

/* --- Botón de Slack --- */
.btn-slack {
  background-color: #4A154B;
  color: #FFFFFF;
}

.btn-slack:hover {
  background-color: #3F103F;
}

/* --- Footer de Acciones --- */
.actions-footer {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}
```

---

## 3. Indicador de Carga y Excepciones de OAuth

Cuando el usuario hace clic en Conectar, el botón pasa a estado cargando (`loading`) desactivando la interactividad:

```html
<button class="btn btn-oauth btn-google loading" disabled>
  <div class="spinner"></div>
  Procesando conexión...
</button>
```

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```
*   **Diseño de Alertas de Error**: En caso de rechazo del consentimiento, se inserta una alerta de clase `.onboarding-alert.critical` con fondo de opacidad de `--accent-red` y contorno en rojo sólido:
    ```css
    .onboarding-alert.critical {
      background: rgba(255, 59, 48, 0.08);
      border: 1px solid var(--accent-red);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: var(--spacing-md);
      margin: var(--spacing-md) 0;
      font-size: 13px;
    }
    ```
