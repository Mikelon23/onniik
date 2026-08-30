/**
 * run-load-test.ts
 * Script CLI para ejecutar la prueba de carga inicial sobre endpoints críticos
 * de la base de datos de Onniik.
 *
 * Uso:
 *   npx ts-node src/scripts/run-load-test.ts
 */

import { runLoadTest, LoadTestOptions } from '../utils/loadTestRunner';
import logger from '../config/logger';

async function main(): Promise<void> {
  const options: LoadTestOptions = {
    host: 'localhost',
    port: Number(process.env.PORT || 5000),
    endpoints: ['/api/v1/health', '/api/v1/saas/products', '/api/v1/docs/json', '/api/health'],
    concurrency: 50,
    totalRequests: 200,
  };

  logger.info(
    `[LoadTest] Iniciando prueba de carga con ${options.concurrency} clientes en paralelo (${options.totalRequests} peticiones en total)...`
  );

  const result = await runLoadTest(options);

  console.log('\n==================================================');
  console.log('         ONNIIK API - RESULTADOS DE PRUEBA DE CARGA');
  console.log('==================================================');
  console.log(`Peticiones Totales : ${result.totalRequests}`);
  console.log(`Exitosas (2xx/3xx) : ${result.successfulRequests}`);
  console.log(`Fallidas (4xx/5xx) : ${result.failedRequests}`);
  console.log(`Duración Total     : ${result.totalDurationMs} ms`);
  console.log(`Throughput         : ${result.requestsPerSecond} req/sec`);
  console.log('--------------------------------------------------');
  console.log('LATENCIAS (ms):');
  console.log(`  Mínima           : ${result.latencyMs.min} ms`);
  console.log(`  Promedio         : ${result.latencyMs.avg} ms`);
  console.log(`  P95              : ${result.latencyMs.p95} ms`);
  console.log(`  P99              : ${result.latencyMs.p99} ms`);
  console.log(`  Máxima           : ${result.latencyMs.max} ms`);
  console.log('--------------------------------------------------');
  console.log('CÓDIGOS DE ESTADO:', JSON.stringify(result.statusCodes));
  console.log('==================================================\n');
}

if (require.main === module) {
  void main();
}
