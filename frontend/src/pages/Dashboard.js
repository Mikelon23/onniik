import { getBackendHealth } from '../js/api.js';

export function Dashboard() {
  return `
    <div class="dashboard-container">
      <h1>Panel de Control</h1>
      <p>Bienvenido al Congelador de Costos SaaS - Onniik.</p>
      
      <div class="status-card">
        <h2>Estado de la API del Servidor</h2>
        <p>Monitoreo en tiempo real del estado de los servicios del backend:</p>
        <ul class="status-list">
          <li>
            <span>Conectividad de API</span>
            <span id="api-status" class="status-value loading">Cargando...</span>
          </li>
          <li>
            <span>Uptime del Servidor</span>
            <span id="api-uptime" class="status-value">-</span>
          </li>
          <li>
            <span>Última Sincronización</span>
            <span id="api-timestamp" class="status-value">-</span>
          </li>
        </ul>
      </div>
      
      <div>
        <button id="refresh-health" class="btn-primary">Actualizar Estado</button>
      </div>
    </div>
  `;
}

export function initDashboard() {
  const statusEl = document.querySelector('#api-status');
  const uptimeEl = document.querySelector('#api-uptime');
  const timestampEl = document.querySelector('#api-timestamp');
  const refreshBtn = document.querySelector('#refresh-health');

  async function updateHealth() {
    if (statusEl) {
      statusEl.textContent = 'Cargando...';
      statusEl.className = 'status-value loading';
    }

    try {
      const healthData = await getBackendHealth();

      if (statusEl && uptimeEl && timestampEl) {
        statusEl.textContent = healthData.status.toUpperCase();
        statusEl.className = 'status-value ok';

        // Format uptime to hh:mm:ss
        const uptimeSeconds = Math.round(healthData.uptime);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;

        uptimeEl.textContent = `${hours}h ${minutes}m ${seconds}s`;

        // Parse ISO String to readable local format
        const date = new Date(healthData.timestamp);
        timestampEl.textContent = date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
      }
    } catch {
      if (statusEl && uptimeEl && timestampEl) {
        statusEl.textContent = 'DESCONECTADO';
        statusEl.className = 'status-value error';
        uptimeEl.textContent = 'N/A';
        timestampEl.textContent = 'Error de conexión con el backend';
      }
    }
  }

  // Initial fetch
  updateHealth();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', updateHealth);
  }
}
