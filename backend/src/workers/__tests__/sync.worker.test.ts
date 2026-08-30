/**
 * sync.worker.test.ts
 * Pruebas unitarias para el trabajador asíncrono de sincronización en segundo plano (sync.worker.ts).
 */

import { Job } from 'bullmq';
import {
  processSyncJob,
  initSyncWorker,
  getSyncWorker,
  closeSyncWorker,
  SyncJobData,
  SyncJobResult,
} from '../sync.worker';
import { initAllWorkers, closeAllWorkers } from '../index';

// Mockear ioredis y bullmq
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
  }));
});

jest.mock('bullmq', () => {
  return {
    Worker: jest
      .fn()
      .mockImplementation((name: string, processor: (...args: unknown[]) => unknown) => {
        const eventHandlers: Record<string, ((...args: unknown[]) => unknown)[]> = {};

        return {
          name,
          processor,
          on: jest.fn((event: string, handler: (...args: unknown[]) => unknown) => {
            if (!eventHandlers[event]) eventHandlers[event] = [];
            eventHandlers[event].push(handler);
          }),
          close: jest.fn().mockResolvedValue(undefined),
        };
      }),
  };
});

describe('Sync Worker (sync.worker.ts)', () => {
  let mockJob: Partial<Job<SyncJobData, SyncJobResult>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await closeAllWorkers();

    mockJob = {
      id: 'job_test_001',
      name: 'sync:organization:saas',
      data: {
        organizationId: 'org_abc123',
        syncType: 'saas',
        options: { forceFullSync: false },
      },
      updateProgress: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('Procesador processSyncJob', () => {
    it('debe procesar exitosamente un trabajo de tipo saas (modo normal)', async () => {
      const result = await processSyncJob(mockJob as Job<SyncJobData, SyncJobResult>);

      expect(mockJob.updateProgress).toHaveBeenCalledWith(25);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(75);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(15);
      expect(result.message).toContain("Sincronización 'saas' completada exitosamente");
    });

    it('debe procesar exitosamente un trabajo de tipo saas con forceFullSync: true', async () => {
      mockJob.data = {
        organizationId: 'org_abc123',
        syncType: 'saas',
        options: { forceFullSync: true },
      };

      const result = await processSyncJob(mockJob as Job<SyncJobData, SyncJobResult>);

      expect(result.itemsProcessed).toBe(120);
    });

    it('debe procesar exitosamente un trabajo de tipo users', async () => {
      mockJob.data = {
        organizationId: 'org_abc123',
        syncType: 'users',
      };

      const result = await processSyncJob(mockJob as Job<SyncJobData, SyncJobResult>);

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(8);
    });

    it('debe procesar exitosamente un trabajo de tipo activity_logs', async () => {
      mockJob.data = {
        organizationId: 'org_abc123',
        syncType: 'activity_logs',
      };

      const result = await processSyncJob(mockJob as Job<SyncJobData, SyncJobResult>);

      expect(result.success).toBe(true);
      expect(result.itemsProcessed).toBe(250);
    });

    it('debe lanzar un error si se pasa un syncType no soportado', async () => {
      mockJob.data = {
        organizationId: 'org_abc123',
        syncType: 'invalid_type' as any,
      };

      await expect(processSyncJob(mockJob as Job<SyncJobData, SyncJobResult>)).rejects.toThrow(
        "Tipo de sincronización no soportado: 'invalid_type'"
      );
    });
  });

  describe('Ciclo de vida del Worker (init / get / close)', () => {
    it('debe inicializar el worker singleton mediante initSyncWorker', () => {
      const worker1 = initSyncWorker();
      const worker2 = initSyncWorker();

      expect(worker1).toBeDefined();
      expect(worker1).toBe(worker2);
      expect(getSyncWorker()).toBe(worker1);
    });

    it('debe apagar el worker correctamente mediante closeSyncWorker', async () => {
      initSyncWorker();
      expect(getSyncWorker()).not.toBeNull();

      await closeSyncWorker();
      expect(getSyncWorker()).toBeNull();
    });

    it('debe inicializar y cerrar todos los workers usando initAllWorkers y closeAllWorkers', async () => {
      initAllWorkers();
      expect(getSyncWorker()).not.toBeNull();

      await closeAllWorkers();
      expect(getSyncWorker()).toBeNull();
    });
  });
});
