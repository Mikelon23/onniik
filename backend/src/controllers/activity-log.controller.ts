/**
 * activity-log.controller.ts
 * Controladores HTTP para el historial de auditoría de Onniik.
 *
 * Los logs son de solo lectura vía API — la creación ocurre
 * internamente desde otros servicios/controladores usando
 * ActivityLogService.log().
 *
 * El control de acceso (RBAC) se aplica en la capa de rutas:
 *   - Solo ADMIN e IT_MANAGER pueden leer los logs de auditoría.
 *   - READER no tiene acceso al historial de auditoría.
 *
 * Tarea 84 — /api/v1/logs
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ActivityLogService } from '../services/activity-log.service';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { ActivityAction } from '@prisma/client';

// ─────────────────────────────────────────────
// Helper: parsear parámetros de paginación
// ─────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(query.limit ?? '50'), 10) || 50));
  return { page, limit };
}

// ═════════════════════════════════════════════
// GET /api/v1/logs/summary
// ═════════════════════════════════════════════

/**
 * Retorna estadísticas y resumen de actividad para el panel de auditoría.
 *
 * IMPORTANTE: debe estar ANTES de /:id en el router.
 *
 * Acceso: ADMIN, IT_MANAGER
 *
 * @example
 * // Response 200
 * {
 *   "status": "success",
 *   "data": {
 *     "totalLogs": 1250,
 *     "recentLogsCount": 87,
 *     "byActorType": [{ "actorType": "user", "count": 900 }, ...],
 *     "byAction": [{ "action": "USER_LOGIN", "count": 320 }, ...],
 *     "recentSecurityActivity": [...]
 *   }
 * }
 */
export const getLogSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const result = await ActivityLogService.getLogSummary(orgId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// GET /api/v1/logs
// ═════════════════════════════════════════════

/**
 * Lista los logs de auditoría de la organización con filtros y paginación.
 *
 * Query params:
 *   - page       (number, default: 1)
 *   - limit      (number, default: 50, máx: 200)
 *   - action     (ActivityAction)
 *   - actorType  ("user" | "system" | "ai_agent")
 *   - userId     (UUID)
 *   - entityType (string)
 *   - entityId   (UUID)
 *   - fromDate   (ISO 8601)
 *   - toDate     (ISO 8601)
 *
 * Acceso: ADMIN, IT_MANAGER
 */
export const listLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);

    const { action, actorType, userId, entityType, entityId, fromDate, toDate } =
      req.query as Record<string, string | undefined>;

    // Validar action si se proporciona
    if (action && !Object.values(ActivityAction).includes(action as ActivityAction)) {
      throw new BadRequestError(
        `Acción inválida. Valores permitidos: ${Object.values(ActivityAction).join(', ')}`
      );
    }

    // Validar actorType si se proporciona
    const validActorTypes = ['user', 'system', 'ai_agent'];
    if (actorType && !validActorTypes.includes(actorType)) {
      throw new BadRequestError(
        `Tipo de actor inválido. Valores permitidos: ${validActorTypes.join(', ')}`
      );
    }

    // Validar fechas si se proporcionan
    if (fromDate && isNaN(Date.parse(fromDate))) {
      throw new BadRequestError('El parámetro fromDate debe ser una fecha ISO 8601 válida.');
    }
    if (toDate && isNaN(Date.parse(toDate))) {
      throw new BadRequestError('El parámetro toDate debe ser una fecha ISO 8601 válida.');
    }

    const result = await ActivityLogService.listLogs(
      orgId,
      {
        action: action as ActivityAction | undefined,
        actorType: actorType as 'user' | 'system' | 'ai_agent' | undefined,
        userId,
        entityType,
        entityId,
        fromDate,
        toDate,
      },
      page,
      limit
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// GET /api/v1/logs/:id
// ═════════════════════════════════════════════

/**
 * Obtiene el detalle de un log de auditoría específico.
 * Valida que pertenezca a la organización del usuario autenticado.
 *
 * Acceso: ADMIN, IT_MANAGER
 */
export const getLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    const log = await ActivityLogService.getLogById(id, orgId);

    if (!log) {
      throw new NotFoundError('El registro de auditoría solicitado no existe.');
    }

    res.status(200).json({
      status: 'success',
      data: { log },
    });
  } catch (error) {
    next(error);
  }
};
