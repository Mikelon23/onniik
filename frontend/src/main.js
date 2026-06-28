import './css/global.css';
import { router } from './js/router.js';
import { checkSession } from './js/session.js';

// Inicializar la sesión y el ruteador una vez cargado el DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Disparar la verificación asíncrona de sesión
  await checkSession();
  // Inicializar el enrutado de la SPA
  router();
});
