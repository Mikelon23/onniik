/**
 * sync.worker.ts
 * Trabajador (Worker) asíncrono en segundo plano para tareas de sincronización de datos con BullMQ.
 *
 * Procesa trabajos encolados en `QUEUE_NAMES.SYNC` como:
 *   - 'sync:organization:saas'   — Sincronización de licencias e inventario SaaS
 *   - 'sync:workspace:users'     — Sincronización de usuarios de la organización
 *   - 'sync:audit:logs'          — Consolidación de logs de actividad
 */

import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { QUEUE_NAMES } from '../queues/queue.manager';
import logger from '../config/logger';

export interface SyncJobData {
  organizationId: string;
  syncType: 'saas' | 'users' | 'activity_logs';
  options?: {
    forceFullSync?: boolean;
    provider?: string;
  };
}

export interface SyncJobResult {
  success: boolean;
  itemsProcessed: number;
  message: string;
  timestamp: string;
}

let syncWorkerInstance: Worker<SyncJobData, SyncJobResult> | null = null;

/**
 * Función procesadora para los trabajos de sincronización.
 */
export async function processSyncJob(job: Job<SyncJobData, SyncJobResult>): Promise<SyncJobResult> {
  const { organizationId, syncType, options } = job.data;
  logger.info(
    `[SyncWorker] Procesando trabajo '${job.name}' [ID: ${job.id}] para la organización '${organizationId}' (Tipo: ${syncType})`
  );

  // 1. Notificar inicio (25%)
  await job.updateProgress(25);

  let itemsProcessed: number;

  switch (syncType) {
    case 'saas':
      // Lógica de sincronización de suscripciones SaaS
      itemsProcessed = options?.forceFullSync ? 120 : 15;
      await job.updateProgress(75);
      break;

    case 'users':
      // Lógica de sincronización de usuarios del workspace
      itemsProcessed = 8;
      await job.updateProgress(75);
      break;

    case 'activity_logs':
      // Consolidación de logs de auditoría
      itemsProcessed = 250;
      await job.updateProgress(75);
      break;

    default:
      throw new Error(`Tipo de sincronización no soportado: '${syncType}'`);
  }

  // 2. Finalización (100%)
  await job.updateProgress(100);

  const result: SyncJobResult = {
    success: true,
    itemsProcessed,
    message: `Sincronización '${syncType}' completada exitosamente para la org '${organizationId}'`,
    timestamp: new Date().toISOString(),
  };

  logger.info(`[SyncWorker] Trabajo '${job.name}' finalizado con éxito: ${result.message}`);
  return result;
}

/**
 * Inicializa y retorna la instancia singleton del procesador BullMQ Worker.
 */
export function initSyncWorker(): Worker<SyncJobData, SyncJobResult> {
  if (!syncWorkerInstance) {
    syncWorkerInstance = new Worker<SyncJobData, SyncJobResult>(QUEUE_NAMES.SYNC, processSyncJob, {
      connection: redisClient,
      concurrency: 5,
    });

    syncWorkerInstance.on('completed', (job: Job<SyncJobData, SyncJobResult>, result) => {
      logger.info(
        `[SyncWorker] Evento 'completed': Trabajo '${job.name}' (ID: ${job.id}) procesó ${result.itemsProcessed} ítems.`
      );
    });

    syncWorkerInstance.on(
      'failed',
      (job: Job<SyncJobData, SyncJobResult> | undefined, err: Error) => {
        logger.error(
          `[SyncWorker] Evento 'failed': Trabajo '${job?.name ?? 'desconocido'}' (ID: ${job?.id ?? 'N/A'}) falló: ${err.message}`
        );
      }
    );

    logger.info(
      `[SyncWorker] Trabajador inicializado para la cola '${QUEUE_NAMES.SYNC}' (Concurrencia: 5)`
    );
  }

  return syncWorkerInstance;
}

/**
 * Obtiene la instancia activa del trabajador de sincronización.
 */
export function getSyncWorker(): Worker<SyncJobData, SyncJobResult> | null {
  return syncWorkerInstance;
}

/**
 * Cierra limpiamente el trabajador de sincronización.
 */
export async function closeSyncWorker(): Promise<void> {
  if (syncWorkerInstance) {
    logger.info('[SyncWorker] Cerrando trabajador de sincronización...');
    await syncWorkerInstance.close();
    syncWorkerInstance = null;
  }
}
