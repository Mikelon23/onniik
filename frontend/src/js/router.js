import { Home, initHome } from '../pages/Home.js';
import { Dashboard, initDashboard } from '../pages/Dashboard.js';
import { Login, initLogin } from '../pages/Login.js';
import { NotFound } from '../pages/NotFound.js';
import { Layout } from '../components/Layout.js';
import { sessionState, logout } from './session.js';

// Mapa de rutas registradas en la aplicación
const routes = {
  '/': { render: Home, init: initHome },
  '/dashboard': { render: Dashboard, init: initDashboard },
  '/login': { render: Login, init: initLogin },
  '/404': { render: NotFound, init: null },
};

/**
 * Realiza la navegación SPA a una URL específica
 * @param {string} url
 */
export function navigateTo(url) {
  window.history.pushState(null, null, url);
  router();
}

/**
 * Motor del ruteador que casa la URL actual y renderiza el componente adecuado
 */
export function router() {
  // 1. Mostrar spinner global si la sesión aún se está verificando
  if (sessionState.loading) {
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; gap: 16px; min-height: 100vh;">
          <svg class="spinner" viewBox="0 0 50 50" style="width: 40px; height: 40px; color: var(--accent); margin-right: 0;">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="var(--accent)"></circle>
          </svg>
          <p style="color: var(--text); font-size: 14px; font-weight: 500; font-family: sans-serif; margin: 0;">Cargando sesión...</p>
        </div>
      `;
    }
    return;
  }

  const path = window.location.pathname;

  // 2. Aplicar guardianes de ruta (Route Guards)
  if (path === '/dashboard' && !sessionState.user) {
    // Redirigir a login si intenta ver el Dashboard sin estar autenticado
    navigateTo('/login');
    return;
  }

  if (path === '/login' && sessionState.user) {
    // Redirigir al Dashboard si ya tiene sesión activa
    navigateTo('/dashboard');
    return;
  }

  const route = routes[path] || routes['/404'];

  // 3. Renderizar la vista dentro del layout global
  const appContainer = document.querySelector('#app');
  if (appContainer) {
    const pageHtml = route.render();
    appContainer.innerHTML = Layout(pageHtml, path);

    // Ejecutar lógica de inicialización específica de la página si existe
    if (route.init) {
      route.init();
    }
  }
}

// Escuchar navegación del historial del navegador (botón atrás/adelante)
window.addEventListener('popstate', router);

// Intercepción global de clics para enlaces con atributo data-link (Event Delegation)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) {
      navigateTo(href);
    }
  }
});

// Interceptor global para cerrar sesión (clic en botón #logout-btn)
document.addEventListener('click', async (e) => {
  const logoutBtn = e.target.closest('#logout-btn');
  if (logoutBtn) {
    e.preventDefault();
    await logout();
    navigateTo('/login');
  }
});
