import { CONFIG } from './config.js';

/**
 * Realiza una llamada de salud (healthcheck) al backend
 * @returns {Promise<{status: string, timestamp: string, uptime: number}>}
 */
export async function getBackendHealth() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching backend health:', error);
    throw error;
  }
}
