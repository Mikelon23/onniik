import './css/global.css';
import { router } from './js/router.js';

// Inicializar el ruteador una vez que el contenido del DOM se ha cargado completamente
document.addEventListener('DOMContentLoaded', () => {
  router();
});
