import { sessionState } from '../js/session.js';

/**
 * Retorna la barra de navegación del Header de forma dinámica basada en el estado de la sesión
 * @param {string} activePath - Ruta activa actual en la SPA
 */
export function Header(activePath) {
  const isInicioActive = activePath === '/' ? 'active' : '';
  const isDashboardActive = activePath === '/dashboard' ? 'active' : '';
  const isLoginActive = activePath === '/login' ? 'active' : '';

  const { user } = sessionState;

  return `
    <header class="main-header">
      <a href="/" class="logo-container" data-link>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 28px;">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="var(--color-primary)" stroke="var(--color-primary)" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <span>Onniik</span>
      </a>
      <nav class="nav-links">
        <a href="/" class="${isInicioActive}" data-link>Inicio</a>
        ${
          user
            ? `
          <a href="/dashboard" class="${isDashboardActive}" data-link>Dashboard</a>
          <button id="logout-btn" class="nav-btn">Cerrar Sesión</button>
        `
            : `
          <a href="/login" class="${isLoginActive}" data-link>Iniciar Sesión</a>
        `
        }
      </nav>
    </header>
  `;
}
