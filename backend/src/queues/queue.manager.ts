/**
 * queue.manager.ts
 * Administrador centralizado de colas de tareas asíncronas con BullMQ para Onniik.
 *
 * Ofrece métodos para:
 *   - Crear y gestionar colas (`getQueue`)
 *   - Encolar tareas (`addJob`)
 *   - Consultar estado de ejecuciones (`getJobStatus`)
 *   - Escuchar eventos globales de cola (`getQueueEvents`)
 *   - Cierre limpio de recursos (`closeQueues`)
 */

import { Queue, QueueEvents, Job, JobsOptions } from 'bullmq';
import { redisClient } from '../config/redis';
import logger from '../config/logger';

/** Nombres estándar de colas del sistema */
export const QUEUE_NAMES = {
  DEFAULT: 'onniik-default-queue',
  SYNC: 'onniik-sync-queue',
  NOTIFICATIONS: 'onniik-notifications-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES] | string;

const queuesMap = new Map<string, Queue>();
const queueEventsMap = new Map<string, QueueEvents>();

/**
 * Obtiene o instancia una cola BullMQ reutilizable basada en el cliente Redis configurado.
 *
 * @param queueName - Nombre identificador de la cola (por defecto: `QUEUES.DEFAULT`)
 */
export function getQueue(queueName: QueueName = QUEUE_NAMES.DEFAULT): Queue {
  if (!queuesMap.has(queueName)) {
    const queue = new Queue(queueName, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600 * 24, // Conservar completadas 24h
          count: 1000,
        },
        removeOnFail: {
          age: 3600 * 24 * 7, // Conservar fallidas 7 días
        },
      },
    });

    queuesMap.set(queueName, queue);
    logger.info(`[QueueManager] Cola inicializada: '${queueName}'`);
  }

  return queuesMap.get(queueName)!;
}

/**
 * Obtiene o instancia un emisor de eventos de la cola (QueueEvents).
 *
 * @param queueName - Nombre de la cola
 */
export function getQueueEvents(queueName: QueueName = QUEUE_NAMES.DEFAULT): QueueEvents {
  if (!queueEventsMap.has(queueName)) {
    const queueEvents = new QueueEvents(queueName, {
      connection: redisClient,
    });

    queueEventsMap.set(queueName, queueEvents);
  }

  return queueEventsMap.get(queueName)!;
}

/**
 * Añade un nuevo trabajo a la cola especificada.
 *
 * @param queueName - Nombre de la cola de destino
 * @param jobName   - Nombre semántico de la tarea (ej. 'sync:slack:workspace')
 * @param data      - Payload de datos requerido para procesar la tarea
 * @param opts      - Opciones adicionales de BullMQ (delay, retries, etc.)
 */
export async function addJob<T = unknown>(
  queueName: QueueName,
  jobName: string,
  data: T,
  opts?: JobsOptions
): Promise<Job<T>> {
  const queue = getQueue(queueName);
  const job = await queue.add(jobName, data, opts);
  logger.info(
    `[QueueManager] Trabajo '${jobName}' encolado en '${queueName}' [ID: ${job.id ?? 'autocreado'}]`
  );
  return job;
}

/**
 * Consulta el estado actual de un trabajo por su ID en una cola específica.
 *
 * @param queueName - Nombre de la cola
 * @param jobId     - ID del trabajo a consultar
 */
export async function getJobStatus(queueName: QueueName, jobId: string) {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    state,
    progress: job.progress,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    timestamp: job.timestamp,
  };
}

/**
 * Cierra limpiamente todas las colas y escuchadores de eventos activos.
 */
export async function closeQueues(): Promise<void> {
  logger.info('[QueueManager] Cerrando todas las colas y escuchadores de eventos...');

  for (const [name, queueEvents] of queueEventsMap.entries()) {
    try {
      await queueEvents.close();
    } catch (err) {
      logger.warn(
        `[QueueManager] Error al cerrar QueueEvents de '${name}': ${(err as Error).message}`
      );
    }
  }
  queueEventsMap.clear();

  for (const [name, queue] of queuesMap.entries()) {
    try {
      await queue.close();
    } catch (err) {
      logger.warn(`[QueueManager] Error al cerrar Queue '${name}': ${(err as Error).message}`);
    }
  }
  queuesMap.clear();
}
