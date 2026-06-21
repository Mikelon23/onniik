# Especificaciones de Alta Fidelidad: Invitación y Gestión de Miembros

Este documento especifica la maquetación HTML y las propiedades CSS avanzadas para construir la pantalla de invitación de nuevos directores y la administración del equipo (`/dashboard/settings/team`) en Onniik.

---

## 1. Maquetación HTML de la Gestión del Equipo

El panel permite enviar invitaciones a correos con dominio coincidente y gestionar la lista de colaboradores activos y pendientes:

```html
<div class="team-settings-container">
  <!-- Cabecera de la Sección -->
  <div class="team-header">
    <h3>Equipo y Accesos</h3>
    <p class="team-desc">Invita a otros miembros del equipo directivo (TI, Finanzas o Compras) para co-administrar tus suscripciones.</p>
  </div>

  <!-- Formulario de Invitación -->
  <div class="invite-box glass-card">
    <h4>Enviar Invitación</h4>
    <form class="invite-form">
      <div class="form-row">
        <div class="form-group flex-1">
          <input type="email" class="form-input" placeholder="correo@tuempresa.com" required>
        </div>
        <div class="form-group select-group">
          <select class="form-input form-select" required aria-label="Seleccionar Rol">
            <option value="" disabled selected>Selecciona Rol</option>
            <option value="ADMIN">Administrador</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Enviar Invitación</button>
      </div>
      <p class="form-help-text">Solo se admiten correos electrónicos que coincidan con el dominio registrado de tu organización.</p>
    </form>
  </div>

  <!-- Listado de Miembros del Equipo -->
  <div class="members-list glass-card">
    <h4>Colaboradores</h4>
    <div class="table-responsive">
      <table class="saas-table">
        <thead>
          <tr>
            <th>Nombre / Email</th>
            <th>Rol asignado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Miembro Activo -->
          <tr>
            <td>
              <div class="user-meta">
                <span class="user-name">Miguel Ángel</span>
                <span class="user-email">miguel@onniik.com</span>
              </div>
            </td>
            <td><span class="badge-role badge-admin">Administrador</span></td>
            <td><span class="badge badge-success">Activo</span></td>
            <td><span class="action-text-muted">Propietario</span></td>
          </tr>
          <!-- Invitación Pendiente -->
          <tr>
            <td>
              <div class="user-meta">
                <span class="user-name">—</span>
                <span class="user-email">cfo_partner@onniik.com</span>
              </div>
            </td>
            <td><span class="badge-role badge-auditor">Auditor</span></td>
            <td><span class="badge badge-warning">Pendiente</span></td>
            <td>
              <button class="btn btn-outline btn-sm btn-danger-hover">Revocar Invitación</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## 2. Hojas de Estilo CSS en Alta Fidelidad

Detalle de estilos para alinear el formulario inline de invitaciones y los badges de control de acceso por rol:

```css
/* --- Formulario Inline --- */
.invite-box {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.invite-box h4 {
  font-family: var(--font-title);
  font-size: 16px;
  margin-bottom: var(--spacing-md);
}

.invite-form .form-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

@media (max-width: 768px) {
  .invite-form .form-row {
    flex-direction: column;
    align-items: stretch;
  }
}

.flex-1 {
  flex: 1;
}

.select-group {
  width: 180px;
}

@media (max-width: 768px) {
  .select-group {
    width: 100%;
  }
}

.form-help-text {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: var(--spacing-sm);
}

/* --- Badges de Roles (RBAC) --- */
.badge-role {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
}

.badge-admin {
  background-color: rgba(47, 105, 255, 0.1);
  color: var(--accent-blue);
  border: 1px solid rgba(47, 105, 255, 0.25);
}

.badge-auditor {
  background-color: rgba(0, 240, 255, 0.05);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 240, 255, 0.2);
}

/* --- Acción de Revocación --- */
.btn-danger-hover:hover {
  border-color: var(--accent-red);
  color: var(--accent-red);
  background-color: rgba(255, 69, 58, 0.05);
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 1px;
}

.action-text-muted {
  font-size: 12px;
  color: var(--text-muted);
}
```

---

## 3. Lógica de Negocio y Control de Dominio

*   **Verificación de Dominio**: El backend debe rechazar peticiones de invitación cuyos dominios no coincidan con el dominio de la organización propietaria (p. ej., si el propietario se registró con `miguel@onniik.com`, solo podrá invitar a usuarios con terminación `@onniik.com`), mitigando el riesgo de fuga de datos hacia terceros.
*   **Foco del Dropdown**: El selector de roles `.form-select` y el input de email corporativo deben tener una transición de color cian brillante cuando están en estado activo (focus).
