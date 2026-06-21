# Especificaciones de Alta Fidelidad: Configuración y Organización

Este documento especifica la maquetación HTML, los campos del formulario de administración y los estilos CSS avanzados de la sección de configuración de perfil y parámetros corporativos (`/dashboard/settings`), detallando además la zona de eliminación segura de datos (cumplimiento RGPD).

---

## 1. Maquetación HTML de las Secciones y Pestañas (Tabs)

El diseño del panel de control se agrupa mediante una navegación interna de pestañas y un área de visualización de formularios segmentada:

```html
<div class="settings-container">
  <!-- Navegación por pestañas (Tabs) -->
  <div class="settings-tabs">
    <button class="tab-btn active" data-target="tab-profile">Mi Perfil</button>
    <button class="tab-btn" data-target="tab-organization">Organización</button>
    <button class="tab-btn" data-target="tab-privacy">Privacidad y Datos</button>
  </div>

  <!-- Contenedores de Contenido (Panels) -->
  <div class="settings-content glass-card">
    
    <!-- Pestaña 1: Mi Perfil -->
    <div class="tab-panel active" id="tab-profile">
      <h3>Datos de la Cuenta</h3>
      <p class="section-desc">Actualiza tu información personal y datos de acceso.</p>
      
      <form class="settings-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="prof-name">Nombre Completo</label>
            <input type="text" id="prof-name" class="form-input" value="Miguel Ángel">
          </div>
          <div class="form-group">
            <label for="prof-email">Correo Electrónico (Google SSO)</label>
            <input type="email" id="prof-email" class="form-input" value="miguel@company.com" disabled>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>

    <!-- Pestaña 3: Privacidad y Datos (Danger Zone) -->
    <div class="tab-panel" id="tab-privacy">
      <h3>Seguridad y Privacidad</h3>
      <p class="section-desc">Configura tus preferencias de privacidad corporativa y retención de información.</p>
      
      <!-- Zona de Peligro (Danger Zone) -->
      <div class="danger-zone">
        <div class="danger-header">
          <h4>Zona de Peligro</h4>
          <p>Estas acciones son permanentes e irreversibles. Por favor procede con precaución.</p>
        </div>
        <div class="danger-actions">
          <div class="danger-item">
            <div>
              <h5>Purgar datos de facturas</h5>
              <p>Elimina permanentemente del servidor todas las facturas PDF escaneadas e historiales OCR.</p>
            </div>
            <button class="btn btn-danger-outline" onclick="confirmPurgeInvoices()">Purgar Facturas</button>
          </div>
          
          <div class="danger-item">
            <div>
              <h5>Eliminar Cuenta e Integración</h5>
              <p>Elimina tu organización completa, accesos OAuth y purga todas las copias de seguridad de Onniik.</p>
            </div>
            <button class="btn btn-danger" onclick="confirmDeleteAccount()">Eliminar Todo</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Estilos para la consistencia de formularios y el diseño explícito de alerta en la Danger Zone:

```css
/* --- Estructura y Navegación de Tabs --- */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-tabs {
  display: flex;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-title);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab-btn:hover, .tab-btn.active {
  color: var(--text-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-cyan);
}

/* --- Paneles y Formularios --- */
.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* --- Zona de Peligro (Danger Zone) --- */
.danger-zone {
  border: 1px solid rgba(255, 59, 48, 0.3);
  background: rgba(255, 59, 48, 0.02);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-lg);
  overflow: hidden;
}

.danger-header {
  background-color: rgba(255, 59, 48, 0.05);
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 59, 48, 0.2);
}

.danger-header h4 {
  color: var(--accent-red);
  font-family: var(--font-title);
  font-size: 16px;
  margin-bottom: 2px;
}

.danger-header p {
  color: var(--text-muted);
  font-size: 12px;
}

.danger-actions {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.danger-item h5 {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 2px;
}

.danger-item p {
  font-size: 12px;
  color: var(--text-muted);
}
```

---

## 3. Seguridad de Privacidad (Cumplimiento de Consentimiento)

*   **Campos Protegidos**: Los campos inmutables como el correo electrónico del administrador centralizado mediante Google SSO (`#prof-email`) deben marcarse con el atributo `disabled`, indicando visualmente que no pueden editarse directamente en la base de datos de Onniik (respetando la fuente única de verdad del Identity Provider).
*   **Mensaje de Advertencia antes de la purga**: Al presionar cualquier botón destructivo, se gatilla un modal de confirmación obligatoria donde el usuario debe escribir la palabra `"ELIMINAR"` para certificar la purga.
