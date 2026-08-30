/**
 * loadTestRunner.ts
 * Herramienta de pruebas de carga iniciales para evaluar la estabilidad
 * de los endpoints de la base de datos de Onniik bajo concurrencia.
 *
 * Mide:
 *   - Peticiones por segundo (RPS / Throughput)
 *   - Distribución de latencia en ms (Mínima, Máxima, Promedio, P95, P99)
 *   - Tasa de éxito vs errores (HTTP 2xx vs 4xx/5xx)
 *   - Estabilidad del pool de conexiones PostgreSQL y Redis
 */

import http from 'http';

export interface LoadTestOptions {
  /** Host donde se ejecuta el servidor API (por defecto localhost) */
  host?: string;
  /** Puerto del servidor (por defecto 5000) */
  port?: number;
  /** Rutas/endpoints a evaluar */
  endpoints: string[];
  /** Número de peticiones simultáneas (concurrencia) */
  concurrency: number;
  /** Número total de peticiones a ejecutar */
  totalRequests: number;
  /** Cabeceras HTTP adicionales (ej. Cookie de sesión o Authorization) */
  headers?: Record<string, string>;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDurationMs: number;
  requestsPerSecond: number;
  latencyMs: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
  statusCodes: Record<number, number>;
}

/**
 * Ejecuta una petición HTTP individual y calcula su latencia en milisegundos.
 */
function makeSingleRequest(
  host: string,
  port: number,
  path: string,
  headers: Record<string, string>
): Promise<{ statusCode: number; durationMs: number }> {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();

    const req = http.request(
      {
        host,
        port,
        path,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        timeout: 5000,
      },
      (res) => {
        res.on('data', () => {}); // Consumir respuesta para liberar socket
        res.on('end', () => {
          const endTime = process.hrtime.bigint();
          const durationMs = Number(endTime - startTime) / 1e6;
          resolve({ statusCode: res.statusCode ?? 500, durationMs });
        });
      }
    );

    req.on('error', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1e6;
      resolve({ statusCode: 503, durationMs });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1e6;
      resolve({ statusCode: 504, durationMs });
    });

    req.end();
  });
}

/**
 * Ejecuta una prueba de carga concurrente sobre los endpoints especificados.
 */
export async function runLoadTest(options: LoadTestOptions): Promise<LoadTestResult> {
  const host = options.host ?? 'localhost';
  const port = options.port ?? 5000;
  const { endpoints, concurrency, totalRequests, headers = {} } = options;

  const latencies: number[] = [];
  const statusCodes: Record<number, number> = {};
  let successfulRequests = 0;
  let failedRequests = 0;

  let requestIndex = 0;
  const overallStartTime = process.hrtime.bigint();

  // Función worker para consumir la cola de peticiones
  async function worker(): Promise<void> {
    while (requestIndex < totalRequests) {
      const currentIndex = requestIndex++;
      if (currentIndex >= totalRequests) break;

      const endpoint = endpoints[currentIndex % endpoints.length];
      const result = await makeSingleRequest(host, port, endpoint, headers);

      latencies.push(result.durationMs);
      statusCodes[result.statusCode] = (statusCodes[result.statusCode] ?? 0) + 1;

      if (result.statusCode >= 200 && result.statusCode < 400) {
        successfulRequests++;
      } else {
        failedRequests++;
      }
    }
  }

  // Lanzar workers concurrentes
  const workers: Promise<void>[] = [];
  const activeConcurrency = Math.min(concurrency, totalRequests);

  for (let i = 0; i < activeConcurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);

  const overallEndTime = process.hrtime.bigint();
  const totalDurationMs = Number(overallEndTime - overallStartTime) / 1e6;

  // Calcular estadísticas de latencia
  latencies.sort((a, b) => a - b);
  const min = latencies.length > 0 ? latencies[0] : 0;
  const max = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  const sum = latencies.reduce((acc, curr) => acc + curr, 0);
  const avg = latencies.length > 0 ? sum / latencies.length : 0;

  const p95Index = Math.floor(latencies.length * 0.95);
  const p99Index = Math.floor(latencies.length * 0.99);

  const p95 = latencies.length > 0 ? latencies[Math.min(p95Index, latencies.length - 1)] : 0;
  const p99 = latencies.length > 0 ? latencies[Math.min(p99Index, latencies.length - 1)] : 0;

  const requestsPerSecond = totalDurationMs > 0 ? (totalRequests / totalDurationMs) * 1000 : 0;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    totalDurationMs: Math.round(totalDurationMs * 100) / 100,
    requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
    latencyMs: {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100,
    },
    statusCodes,
  };
}
