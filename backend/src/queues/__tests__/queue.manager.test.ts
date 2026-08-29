/**
 * queue.manager.test.ts
 * Pruebas unitarias para el administrador de colas de tareas asíncronas con BullMQ (queue.manager.ts)
 * y la configuración del cliente Redis (redis.ts).
 */

import {
  getRedisClient,
  isRedisConnected,
  closeRedis,
  defaultRedisOptions,
} from '../../config/redis';
import {
  getQueue,
  getQueueEvents,
  addJob,
  getJobStatus,
  closeQueues,
  QUEUE_NAMES,
} from '../queue.manager';

// Mockear ioredis y bullmq para pruebas aisladas in-memory
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const listeners: Record<string, ((...args: unknown[]) => unknown)[]> = {};

    return {
      on: jest.fn((event: string, cb: (...args: unknown[]) => unknown) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
      }),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };
  });
});

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation((name: string) => ({
      name,
      add: jest.fn().mockResolvedValue({
        id: 'job_uuid_123',
        name: 'test:action',
        data: { payload: 'demo' },
      }),
      getJob: jest.fn().mockImplementation((jobId: string) => {
        if (jobId === 'job_not_found') return Promise.resolve(null);
        return Promise.resolve({
          id: jobId,
          name: 'test:action',
          data: { payload: 'demo' },
          getState: jest.fn().mockResolvedValue('completed'),
          progress: 100,
          failedReason: null,
          finishedOn: 1600000000,
          processedOn: 1599999900,
          timestamp: 1599999800,
        });
      }),
      close: jest.fn().mockResolvedValue(undefined),
    })),
    QueueEvents: jest.fn().mockImplementation((name: string) => ({
      name,
      close: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('Redis & QueueManager (redis.ts / queue.manager.ts)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await closeQueues();
    await closeRedis();
  });

  describe('Configuración de Redis (redis.ts)', () => {
    it('debe tener maxRetriesPerRequest: null en las opciones por defecto de Redis (requerido por BullMQ)', () => {
      expect(defaultRedisOptions.maxRetriesPerRequest).toBeNull();
    });

    it('debe instanciar y retornar un cliente ioredis singleton', () => {
      const client1 = getRedisClient();
      const client2 = getRedisClient();

      expect(client1).toBeDefined();
      expect(client1).toBe(client2);
    });

    it('debe cerrar el cliente Redis adecuadamente al llamar a closeRedis', async () => {
      getRedisClient();
      await closeRedis();
      expect(isRedisConnected()).toBe(false);
    });
  });

  describe('Administrador de Colas (queue.manager.ts)', () => {
    it('debe retornar una cola BullMQ con el nombre predeterminado si no se especifica uno', () => {
      const queue = getQueue();
      expect(queue).toBeDefined();
      expect(queue.name).toBe(QUEUE_NAMES.DEFAULT);
    });

    it('debe reutilizar la misma instancia de cola si se solicita la misma cola varias veces (Map singleton)', () => {
      const queueA = getQueue(QUEUE_NAMES.SYNC);
      const queueB = getQueue(QUEUE_NAMES.SYNC);

      expect(queueA).toBe(queueB);
    });

    it('debe instanciar un QueueEvents para una cola específica', () => {
      const queueEvents = getQueueEvents(QUEUE_NAMES.NOTIFICATIONS);
      expect(queueEvents).toBeDefined();
      expect(queueEvents.name).toBe(QUEUE_NAMES.NOTIFICATIONS);
    });

    it('debe agregar un trabajo a la cola especificada mediante addJob', async () => {
      const job = await addJob(QUEUE_NAMES.SYNC, 'sync:workspace:users', { orgId: 'org_123' });

      expect(job).toBeDefined();
      expect(job.id).toBe('job_uuid_123');
      expect(job.name).toBe('test:action');
    });

    it('debe obtener la información del estado del trabajo por su ID', async () => {
      const status = await getJobStatus(QUEUE_NAMES.SYNC, 'job_uuid_123');

      expect(status).not.toBeNull();
      expect(status?.id).toBe('job_uuid_123');
      expect(status?.state).toBe('completed');
      expect(status?.progress).toBe(100);
    });

    it('debe retornar null si el trabajo no existe al llamar a getJobStatus', async () => {
      const status = await getJobStatus(QUEUE_NAMES.SYNC, 'job_not_found');
      expect(status).toBeNull();
    });

    it('debe cerrar limpiamente todas las colas y escuchadores al llamar a closeQueues', async () => {
      getQueue(QUEUE_NAMES.DEFAULT);
      getQueueEvents(QUEUE_NAMES.DEFAULT);

      await closeQueues();

      // Al volver a pedir la cola, debe instanciarse una nueva
      const newQueue = getQueue(QUEUE_NAMES.DEFAULT);
      expect(newQueue).toBeDefined();
    });
  });
});
