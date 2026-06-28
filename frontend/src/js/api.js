import { CONFIG } from './config.js';

/**
 * Clase personalizada para representar errores de llamadas a la API
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // Código HTTP (ej. 400, 401, 404, 500) o 0 para error de red
    this.details = details; // Detalles del error (ej. validaciones de campos)
  }
}

/**
 * Función auxiliar para realizar peticiones HTTP de forma segura
 * @param {string} endpoint - Ruta del endpoint de la API (ej. '/health')
 * @param {RequestInit & {body?: any}} options - Opciones de configuración de fetch
 */
async function request(endpoint, options = {}) {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${CONFIG.API_URL}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    credentials: 'include',
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage =
        data?.message || `Error en la petición: ${response.status} ${response.statusText}`;
      const errorDetails = data?.details || null;
      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Error genérico de red (servidor apagado, CORS bloqueado, timeout)
    throw new ApiError(error.message || 'Error de conexión de red o del servidor', 0);
  }
}

// Cliente centralizado de API
export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Realiza una llamada de salud (healthcheck) al backend
 * Compatibilidad garantizada con Dashboard.js
 */
export async function getBackendHealth() {
  return apiClient.get('/health');
}
