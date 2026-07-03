import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * GET /api/v1/health (también disponible en /api/health para compatibilidad)
 *
 * Devuelve el estado de salud del servicio incluyendo:
 * - Estado de la conexión a la base de datos (PostgreSQL)
 * - Uptime del proceso
 * - Uso de memoria del proceso Node.js
 * - Metadatos del servicio (versión, entorno)
 */
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  // ── Verificación de conexión a PostgreSQL ──────────────────────────
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'error';
    dbError = err instanceof Error ? err.message : 'Unknown database error';
  }

  // ── Métricas de memoria del proceso ───────────────────────────────
  const memUsage = process.memoryUsage();
  const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  // ── Estado general del servicio ───────────────────────────────────
  const overallStatus = dbStatus === 'ok' ? 'ok' : 'degraded';
  const httpStatus = overallStatus === 'ok' ? 200 : 503;

  res.status(httpStatus).json({
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError && { error: dbError }),
      },
    },
    memory: {
      heapUsed: formatMB(memUsage.heapUsed),
      heapTotal: formatMB(memUsage.heapTotal),
      rss: formatMB(memUsage.rss),
      external: formatMB(memUsage.external),
    },
  });
};
