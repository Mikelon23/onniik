// Configuración centralizada para la aplicación frontend
export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENV: import.meta.env.MODE || 'development',
};
