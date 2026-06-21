# Especificaciones de Layout Responsivo: Sidebar y Header

Este documento especifica la estructura HTML, los estilos CSS vanilla y las media queries necesarias para construir el contenedor principal de la aplicación, el menú lateral (Sidebar) y la barra superior (Header) con soporte multidispositivo responsivo.

---

## 1. Maquetación HTML del Shell de la Aplicación

La estructura base envuelve la navegación lateral y el flujo de contenido principal:

```html
<div class="app-layout">
  <!-- Botón Hamburguesa (Móviles) -->
  <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x1="20" y1="12" y2="12"/><line x1="4" x1="20" y1="6" y2="6"/><line x1="4" x1="20" y1="18" y2="18"/></svg>
  </button>

  <!-- Sidebar (Navegación Lateral) -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <h2>ONNIIK</h2>
    </div>
    <nav class="sidebar-nav">
      <a href="/dashboard" class="nav-item active">
        <span class="nav-icon">[🏠]</span> Dashboard
      </a>
      <a href="/savings" class="nav-item">
        <span class="nav-icon">[📊]</span> Ahorros
      </a>
      <a href="/integrations" class="nav-item">
        <span class="nav-icon">[🔌]</span> Integraciones
      </a>
      <a href="/copilot" class="nav-item">
        <span class="nav-icon">[💬]</span> Copilot
      </a>
    </nav>
  </aside>

  <!-- Viewport de Contenido -->
  <div class="main-content">
    <!-- Header (Barra Superior) -->
    <header class="app-header glass-card">
      <div class="search-bar">
        <input type="text" placeholder="Buscar suscripción..." aria-label="Buscar">
      </div>
      <div class="header-actions">
        <button class="notification-btn" aria-label="Alertas y Notificaciones">
          <span class="bell-icon">[🔔]</span>
        </button>
        <div class="profile-dropdown">
          <button class="profile-btn" aria-haspopup="true" aria-expanded="false">
            <span class="avatar">M</span>
            <span class="profile-name">Admin</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido Flexible de la Ruta -->
    <main class="page-body">
      <!-- Aquí se inyectan las vistas correspondientes -->
    </main>
  </div>
</div>
```

---

## 2. Estilos CSS del Layout y Media Queries

Los estilos aseguran el comportamiento off-canvas del menú en resoluciones inferiores a 768px:

```css
/* --- Contenedor Principal --- */
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* --- Menú Lateral (Escritorio) --- */
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-logo {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo h2 {
  font-family: var(--font-title);
  color: var(--accent-cyan);
  letter-spacing: 0.05em;
}

.sidebar-nav {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.active {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  border-left: 3px solid var(--accent-cyan);
  padding-left: 9px;
}

/* --- Área de Contenido --- */
.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* --- Barra Superior sticky --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  border-radius: 0;
  border-left: none;
  border-top: none;
  padding: 0 var(--spacing-lg);
}

.menu-toggle {
  display: none;
}

/* --- Adaptabilidad Móvil (Responsive Media Query) --- */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  }

  /* Cuando el sidebar está abierto */
  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);
    color: var(--bg-primary);
    border: none;
    box-shadow: var(--glow-cyan);
    z-index: 110;
    cursor: pointer;
  }
}
```

---

## 3. Pautas de Foco y Accesibilidad

*   **Indicador de Foco**: Todos los enlaces de navegación y botones deben conservar el borde de accesibilidad nativo al navegar por teclado, configurándose un contorno cian eléctrico en caso de tabulación:
    ```css
    .nav-item:focus-visible, .menu-toggle:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
    }
    ```
*   **Atributos Dinámicos**: En móviles, al hacer clic en el botón de hamburguesa (`.menu-toggle`), se añade la clase `.open` al elemento `.sidebar`, y se actualiza el atributo `aria-expanded` a `true` mediante Javascript interactivo.
