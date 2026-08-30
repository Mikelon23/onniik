/**
 * loadTestRunner.test.ts
 * Pruebas unitarias para el ejecutor de pruebas de carga `runLoadTest`.
 */

import express from 'express';
import http from 'http';
import { runLoadTest } from '../loadTestRunner';

describe('loadTestRunner', () => {
  let server: http.Server;
  let testPort: number;

  beforeAll((done) => {
    const app = express();
    app.get('/test-db-endpoint', (_req, res) => {
      res.status(200).json({ status: 'ok', data: [1, 2, 3] });
    });
    app.get('/test-error-endpoint', (_req, res) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });

    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        testPort = address.port;
      }
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('debe ejecutar peticiones concurrentes y retornar métricas completas de rendimiento', async () => {
    const result = await runLoadTest({
      host: 'localhost',
      port: testPort,
      endpoints: ['/test-db-endpoint'],
      concurrency: 5,
      totalRequests: 20,
    });

    expect(result.totalRequests).toBe(20);
    expect(result.successfulRequests).toBe(20);
    expect(result.failedRequests).toBe(0);
    expect(result.requestsPerSecond).toBeGreaterThan(0);
    expect(result.latencyMs.avg).toBeGreaterThanOrEqual(0);
    expect(result.statusCodes[200]).toBe(20);
  });

  it('debe registrar correctamente peticiones fallidas (HTTP 5xx)', async () => {
    const result = await runLoadTest({
      host: 'localhost',
      port: testPort,
      endpoints: ['/test-error-endpoint'],
      concurrency: 3,
      totalRequests: 9,
    });

    expect(result.totalRequests).toBe(9);
    expect(result.successfulRequests).toBe(0);
    expect(result.failedRequests).toBe(9);
    expect(result.statusCodes[500]).toBe(9);
  });

  it('debe manejar errores de conexión en puertos cerrados o inexistentes', async () => {
    const result = await runLoadTest({
      host: 'localhost',
      port: 59999, // Puerto inalcanzable
      endpoints: ['/non-existent'],
      concurrency: 2,
      totalRequests: 4,
    });

    expect(result.totalRequests).toBe(4);
    expect(result.failedRequests).toBe(4);
    expect(result.statusCodes[503]).toBe(4);
  });
});
