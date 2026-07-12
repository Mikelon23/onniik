/**
 * activity-log.service.ts
 * Servicio de auditoría de logs para Onniik — Tarea 84.
 *
 * ──────────────────────────────────────────────────────────────
 * PRINCIPIOS DE DISEÑO
 * ──────────────────────────────────────────────────────────────
 *
 * 1. APPEND-ONLY: Los logs NUNCA se actualizan ni se eliminan.
 *    Son el registro inmutable de lo que ocurrió en el sistema.
 *
 * 2. FIRE-AND-FORGET: `createLog()` absorbe sus propios errores
 *    (nunca lanza excepciones al caller). Un fallo de auditoría
 *    NO debe interrumpir la operación de negocio que lo disparó.
 *
 * 3. TRAZABILIDAD TOTAL: Cada acción critica del sistema pasa
 *    por este servicio — autenticación, suscripciones, alertas,
 *    integraciones, exportaciones y cambios de datos sensibles.
 *
 * 4. MULTI-TENANT: Todas las queries incluyen `organizationId`
 *    como filtro obligatorio para garantizar el aislamiento.
 *
 * ──────────────────────────────────────────────────────────────
 * USO DESDE OTROS SERVICIOS (importar y llamar)
 * ──────────────────────────────────────────────────────────────
 *
 * import { ActivityLogService } from './activity-log.service';
 *
 * // En un controlador:
 * await ActivityLogService.log({
 *   organizationId: req.user.organizationId,
 *   userId: req.user.id,
 *   action: 'SUBSCRIPTION_CANCELLED',
 *   entityType: 'subscription',
 *   entityId: subscriptionId,
 *   metadata: { reason, productName },
 *   ipAddress: req.ip,
 *   userAgent: req.get('user-agent'),
 * });
 *
 * // Desde el motor IA (sin userId):
 * await ActivityLogService.log({
 *   organizationId,
 *   actorType: 'ai_agent',
 *   action: 'ALERT_CREATED',
 *   entityType: 'alert',
 *   entityId: alertId,
 *   metadata: { alertType, estimatedSavings, aiModelVersion },
 * });
 *
 * ──────────────────────────────────────────────────────────────
 * Tarea 84 — /api/v1/logs
 */

import prisma from '../config/db';
import { ActivityAction, Prisma } from '@prisma/client';
import logger from '../config/logger';

// ─────────────────────────────────────────────
// Tipos de actor del sistema
// ─────────────────────────────────────────────

export type ActorType = 'user' | 'system' | 'ai_agent';

// ─────────────────────────────────────────────
// DTO de entrada para crear un log
// ─────────────────────────────────────────────

/**
 * Datos necesarios para registrar una entrada de auditoría.
 * Diseñado para ser llamado desde controladores, servicios y workers.
 */
export interface CreateLogDto {
  /** UUID de la organización afectada (obligatorio — multi-tenant) */
  organizationId: string;

  /**
   * UUID del usuario que realizó la acción.
   * NULL si el actor es el sistema (cron job, motor IA, worker).
   */
  userId?: string | null;

  /**
   * Tipo de actor:
   *   - "user"     → usuario humano autenticado
   *   - "system"   → cron job, worker, proceso automatizado
   *   - "ai_agent" → motor de IA / LLM de Onniik
   */
  actorType?: ActorType;

  /** Acción registrada del enum ActivityAction */
  action: ActivityAction;

  /**
   * Tipo de entidad afectada por la acción.
   * Ejemplos: "subscription", "user", "integration", "alert", "organization"
   */
  entityType?: string | null;

  /** UUID de la entidad afectada */
  entityId?: string | null;

  /**
   * Contexto adicional en formato JSON libre.
   * Variables según el tipo de acción — ej. { reason, productName, oldStatus, newStatus }
   */
  metadata?: Record<string, unknown> | null;

  /** Dirección IP del cliente (del req.ip de Express) */
  ipAddress?: string | null;

  /** User-Agent del cliente (del header HTTP) */
  userAgent?: string | null;
}

// ─────────────────────────────────────────────
// Filtros para consultar logs
// ─────────────────────────────────────────────

/** Filtros opcionales para listar logs de auditoría */
export interface ListLogsFilter {
  /** Filtrar por tipo de acción */
  action?: ActivityAction;
  /** Filtrar por tipo de actor ("user" | "system" | "ai_agent") */
  actorType?: ActorType;
  /** Filtrar logs de un usuario específico */
  userId?: string;
  /** Filtrar logs de una entidad específica */
  entityType?: string;
  entityId?: string;
  /** Rango de fechas (ISO 8601) */
  fromDate?: string;
  toDate?: string;
}

// ─────────────────────────────────────────────
// Proyección segura — ActivityLog
// ─────────────────────────────────────────────

const LOG_PUBLIC_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  user: {
    select: { id: true, name: true, email: true, role: true },
  },
  actorType: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  // Sin updatedAt — los logs son inmutables
} as const;

// ─────────────────────────────────────────────
// ActivityLogService
// ─────────────────────────────────────────────

export const ActivityLogService = {
  /**
   * Registra una entrada de auditoría en la base de datos.
   *
   * FIRE-AND-FORGET: Este método absorbe todos los errores internamente.
   * Un fallo de auditoría NUNCA debe interrumpir la operación de negocio
   * principal que lo disparó. Si el log falla, se registra en Winston.
   *
   * Diseñado para ser llamado desde:
   *   - Controladores de auth (login, logout, register)
   *   - Servicios de SaaS (subscription created/cancelled)
   *   - Servicio de alertas (alert created/accepted/dismissed)
   *   - Workers de integraciones (sync started/completed/failed)
   *   - Motor de IA (draft generated, analysis triggered)
   *
   * @param dto - Datos de la acción a registrar
   * @returns El log creado, o null si falló silenciosamente
   *
   * @example
   * // Desde un controlador — no await para no bloquear la respuesta:
   * void ActivityLogService.log({ organizationId, userId, action: 'USER_LOGIN', ipAddress: req.ip });
   *
   * @example
   * // Cuando necesitas el log creado (ej. para testeo):
   * const log = await ActivityLogService.log({ ... });
   */
  async log(dto: CreateLogDto) {
    try {
      const log = await prisma.activityLog.create({
        data: {
          organizationId: dto.organizationId,
          userId: dto.userId ?? null,
          actorType: dto.actorType ?? 'user',
          action: dto.action,
          entityType: dto.entityType ?? null,
          entityId: dto.entityId ?? null,
          metadata:
            dto.metadata !== undefined && dto.metadata !== null
              ? (dto.metadata as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          ipAddress: dto.ipAddress ?? null,
          userAgent: dto.userAgent ?? null,
        },
        select: LOG_PUBLIC_SELECT,
      });

      return log;
    } catch (error) {
      // FIRE-AND-FORGET: registrar el error pero NO relanzarlo
      logger.error('[ActivityLog] Error al registrar entrada de auditoría:', {
        error: error instanceof Error ? error.message : String(error),
        action: dto.action,
        organizationId: dto.organizationId,
        userId: dto.userId,
      });
      return null;
    }
  },

  /**
   * Lista los logs de auditoría de una organización con filtros y paginación.
   * Siempre filtra por organizationId — aislamiento multi-tenant garantizado.
   *
   * Ordenados por fecha de creación descendente (más reciente primero).
   *
   * @param orgId  - UUID de la organización (del JWT)
   * @param filter - Filtros opcionales
   * @param page   - Número de página (1-indexed, default: 1)
   * @param limit  - Registros por página (default: 50, máx: 200)
   */
  async listLogs(orgId: string, filter: ListLogsFilter = {}, page = 1, limit = 50) {
    const safeLimit = Math.min(limit, 200);
    const skip = (page - 1) * safeLimit;

    // Construir condición WHERE dinámica
    const where: Record<string, unknown> = { organizationId: orgId };

    if (filter.action) where.action = filter.action;
    if (filter.actorType) where.actorType = filter.actorType;
    if (filter.userId) where.userId = filter.userId;
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;

    // Filtro de rango de fechas
    if (filter.fromDate || filter.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filter.fromDate) dateFilter.gte = new Date(filter.fromDate);
      if (filter.toDate) dateFilter.lte = new Date(filter.toDate);
      where.createdAt = dateFilter;
    }

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        select: LOG_PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page, limit: safeLimit };
  },

  /**
   * Obtiene el detalle de un log de auditoría específico.
   * Valida que pertenezca a la organización del usuario autenticado.
   *
   * @param logId - UUID del log
   * @param orgId - UUID de la organización (del JWT)
   * @throws {Error} Si el log no existe o es de otra organización
   */
  async getLogById(logId: string, orgId: string) {
    const log = await prisma.activityLog.findUnique({
      where: { id: logId },
      select: LOG_PUBLIC_SELECT,
    });

    if (!log || log.organizationId !== orgId) {
      return null;
    }

    return log;
  },

  /**
   * Retorna un resumen estadístico de los logs de auditoría para una organización.
   *
   * Métricas calculadas:
   *   - Total de logs en el sistema
   *   - Distribución por tipo de acción (top acciones)
   *   - Distribución por tipo de actor
   *   - Actividad de los últimos 7 días (por día)
   *
   * @param orgId - UUID de la organización (del JWT)
   */
  async getLogSummary(orgId: string) {
    // Query 1: total de logs
    const totalLogs = await prisma.activityLog.count({
      where: { organizationId: orgId },
    });

    // Query 2: distribución por tipo de actor
    const byActorType = await prisma.activityLog.groupBy({
      by: ['actorType'],
      where: { organizationId: orgId },
      _count: { id: true },
    });

    // Query 3: distribución por acción (top 10)
    const byAction = await prisma.activityLog.groupBy({
      by: ['action'],
      where: { organizationId: orgId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Query 4: logs de los últimos 7 días (usando createdAt >= 7 días atrás)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogsCount = await prisma.activityLog.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Query 5: últimas 5 acciones de seguridad críticas (login, password changes)
    const securityActions: ActivityAction[] = [
      'USER_LOGIN',
      'USER_LOGOUT',
      'PASSWORD_CHANGED',
      'MEMBER_INVITED',
      'MEMBER_REMOVED',
      'ROLE_CHANGED',
    ];

    const recentSecurityLogs = await prisma.activityLog.findMany({
      where: {
        organizationId: orgId,
        action: { in: securityActions },
      },
      select: LOG_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      totalLogs,
      recentLogsCount, // últimos 7 días
      byActorType: byActorType.map((row) => ({
        actorType: row.actorType,
        count: row._count.id,
      })),
      byAction: byAction.map((row) => ({
        action: row.action,
        count: row._count.id,
      })),
      recentSecurityActivity: recentSecurityLogs,
    };
  },
};
