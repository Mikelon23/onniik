/**
 * redis.ts
 * Configuración del cliente Redis singleton para Onniik.
 *
 * Utiliza ioredis con opciones optimizadas para BullMQ:
 *   - maxRetriesPerRequest: null (Requisito obligatorio de BullMQ)
 *   - Manejo de reconexiones automáticas
 *   - Estrategia de degradación elegante (evita que el servidor colapse si Redis está inaccesible)
 */

import Redis, { RedisOptions } from 'ioredis';
import logger from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Opciones por defecto para el cliente Redis de ioredis.
 * `maxRetriesPerRequest: null` es obligatorio para BullMQ.
 */
export const defaultRedisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // Reintentos con incremento exponencial (máx 3 segundos entre intentos)
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
};

let redisInstance: Redis | null = null;
let isConnected = false;

/**
 * Obtiene o inicializa la instancia singleton del cliente Redis.
 */
export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(REDIS_URL, defaultRedisOptions);

    redisInstance.on('connect', () => {
      isConnected = true;
      logger.info(`[Redis] Conexión establecida con Redis en ${REDIS_URL}`);
    });

    redisInstance.on('ready', () => {
      isConnected = true;
    });

    redisInstance.on('error', (err) => {
      isConnected = false;
      logger.warn(`[Redis] Advertencia/Error de conexión en Redis: ${err.message}`);
    });

    redisInstance.on('close', () => {
      isConnected = false;
    });
  }

  return redisInstance;
}

/**
 * Retorna si la conexión con Redis está actualmente activa.
 */
export function isRedisConnected(): boolean {
  return isConnected;
}

/**
 * Cierra limpiamente la conexión del cliente Redis singleton.
 */
export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
    } catch {
      redisInstance.disconnect();
    } finally {
      redisInstance = null;
      isConnected = false;
    }
  }
}

/** Instancia exportada por defecto para fácil acceso */
export const redisClient = getRedisClient();
