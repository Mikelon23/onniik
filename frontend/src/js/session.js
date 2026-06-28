import { apiClient } from './api.js';

// Estado global de la sesión del usuario (en memoria)
export const sessionState = {
  user: null,
  loading: true,
};

// Colección de callbacks para notificar cuando cambia el estado de sesión
const listeners = new Set();

/**
 * Registra un listener que se ejecuta ante cualquier cambio de estado
 */
export function subscribeToSession(callback) {
  listeners.add(callback);
  // Retornar función para desuscribirse
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Notifica a todos los suscriptores de un cambio en la sesión
 */
function notifyChange() {
  listeners.forEach((callback) => callback({ ...sessionState }));
}

/**
 * Verifica si existe una cookie de sesión activa consultando al backend
 */
export async function checkSession() {
  sessionState.loading = true;
  notifyChange();

  try {
    const result = await apiClient.get('/auth/me');
    if (result && result.status === 'success' && result.data?.user) {
      sessionState.user = result.data.user;
    } else {
      sessionState.user = null;
    }
  } catch {
    // Si falla (ej. 401 Unauthorized), el usuario no está logueado
    sessionState.user = null;
  } finally {
    sessionState.loading = false;
    notifyChange();
  }
  return sessionState.user;
}

/**
 * Realiza el inicio de sesión contra el backend
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  sessionState.loading = true;
  notifyChange();

  try {
    const result = await apiClient.post('/auth/login', { email, password });
    if (result && result.status === 'success' && result.data?.user) {
      sessionState.user = result.data.user;
      notifyChange();
      return result.data.user;
    } else {
      throw new Error('Formato de respuesta de inicio de sesión inválido.');
    }
  } catch (error) {
    sessionState.user = null;
    notifyChange();
    throw error; // Propagar error para que la interfaz lo dibuje
  } finally {
    sessionState.loading = false;
    notifyChange();
  }
}

/**
 * Realiza el cierre de sesión contra el backend
 */
export async function logout() {
  sessionState.loading = true;
  notifyChange();

  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Error al cerrar sesión en el backend:', error);
  } finally {
    sessionState.user = null;
    sessionState.loading = false;
    notifyChange();
  }
}
