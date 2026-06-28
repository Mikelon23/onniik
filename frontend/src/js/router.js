import { Home, initHome } from '../pages/Home.js';
import { Dashboard, initDashboard } from '../pages/Dashboard.js';
import { NotFound } from '../pages/NotFound.js';
import { Layout } from '../components/Layout.js';

// Mapa de rutas registradas en la aplicación
const routes = {
  '/': { render: Home, init: initHome },
  '/dashboard': { render: Dashboard, init: initDashboard },
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
  const path = window.location.pathname;
  const route = routes[path] || routes['/404'];

  // Renderizar la vista dentro del layout global
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
