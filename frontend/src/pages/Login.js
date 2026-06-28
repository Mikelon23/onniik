import { login } from '../js/session.js';
import { navigateTo } from '../js/router.js';

/**
 * Retorna la estructura HTML de la vista de Login
 */
export function Login() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" fill="var(--color-primary)" stroke="var(--color-primary)" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder a Onniik</p>
        </div>

        <div id="login-error" class="alert error hidden"></div>

        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" placeholder="ejemplo@acme.com" required autocomplete="email" />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
          </div>

          <button type="submit" id="login-submit" class="btn btn-primary btn-block">
            <span>Ingresar</span>
          </button>
        </form>
        
        <div class="login-help">
          <p>Credenciales de prueba: <strong>admin@acme.com</strong> / <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Inicializa la lógica interactiva del formulario de Login
 */
export function initLogin() {
  const form = document.querySelector('#login-form');
  const errorEl = document.querySelector('#login-error');
  const submitBtn = document.querySelector('#login-submit');

  if (!form || !errorEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    errorEl.textContent = '';
    errorEl.classList.add('hidden');

    const email = document.querySelector('#email')?.value.trim();
    const password = document.querySelector('#password')?.value;

    if (!email || !password) {
      errorEl.textContent = 'Por favor, completa todos los campos.';
      errorEl.classList.remove('hidden');
      return;
    }

    // Cambiar estado del botón a carga
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
      <span>Iniciando sesión...</span>
    `;

    try {
      await login(email, password);
      // Navegar al Dashboard al autenticar exitosamente
      navigateTo('/dashboard');
    } catch (error) {
      // Mostrar el error formateado de la API o de conexión
      errorEl.textContent = error.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      errorEl.classList.remove('hidden');

      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
