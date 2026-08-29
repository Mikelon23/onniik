/**
 * index.ts
 * Gestor centralizado de arranque y apagado para todos los trabajadores (Workers) del backend.
 */

import { initSyncWorker, closeSyncWorker } from './sync.worker';
import logger from '../config/logger';

/**
 * Inicializa todos los trabajadores en segundo plano del sistema.
 */
export function initAllWorkers(): void {
  logger.info('[Workers] Inicializando todos los trabajadores en segundo plano...');
  initSyncWorker();
}

/**
 * Cierra limpiamente todos los trabajadores activos.
 */
export async function closeAllWorkers(): Promise<void> {
  logger.info('[Workers] Apagando todos los trabajadores en segundo plano...');
  await closeSyncWorker();
}

export * from './sync.worker';
