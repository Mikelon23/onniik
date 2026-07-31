/**
 * alert.controller.ts
 * Controladores HTTP para las alertas de optimización de Onniik.
 *
 * Todos los controladores delegan la lógica de negocio a alert.service.ts.
 * El control de acceso (RBAC) se aplica en la capa de rutas.
 *
 * SEGURIDAD:
 *   - El organizationId siempre proviene del JWT (req.user), nunca del body.
 *   - El resolvedById siempre proviene del JWT — nunca del cliente.
 *
 * Tarea 83 — /api/v1/alerts
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AlertService, CreateAlertDto, ResolveAlertDto } from '../services/alert.service';
import { AlertType, AlertStatus, AlertPriority } from '@prisma/client';
import { ActivityLogService } from '../services/activity-log.service';

// ─────────────────────────────────────────────
// Helper: parsear parámetros de paginación
// ─────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10) || 20));
  return { page, limit };
}

// ═════════════════════════════════════════════
// GET /api/v1/alerts
// ═════════════════════════════════════════════

/**
 * Lista las alertas de optimización de la organización del usuario autenticado.
 *
 * Query params:
 *   - page         (number, default: 1)
 *   - limit        (number, default: 20, máx: 100)
 *   - status       (AlertStatus)
 *   - alertType    (AlertType)
 *   - priority     (AlertPriority)
 *   - subscriptionId (UUID)
 *
 * Acceso: todos los roles autenticados (ver panel de alertas)
 */
export const listAlerts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);

    const { status, alertType, priority, subscriptionId } = req.query as Record<
      string,
      string | undefined
    >;

    const result = await AlertService.listAlerts(
      orgId,
      {
        status: status as AlertStatus | undefined,
        alertType: alertType as AlertType | undefined,
        priority: priority as AlertPriority | undefined,
        subscriptionId,
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
// GET /api/v1/alerts/summary
// ═════════════════════════════════════════════

/**
 * Retorna el resumen de KPIs de alertas para el Dashboard principal.
 *
 * IMPORTANTE: debe registrarse ANTES de /alerts/:id para que Express
 * no interprete "summary" como un UUID.
 *
 * Acceso: todos los roles autenticados
 *
 * @example
 * // Response 200
 * {
 *   "status": "success",
 *   "data": {
 *     "summary": { "byStatus": {...}, "byType": [...], "byPriority": [...] },
 *     "kpis": {
 *       "totalAlerts": 15,
 *       "pendingCount": 8,
 *       "totalPotentialSavings": 12500.00,
 *       "confirmedSavings": 4200.00,
 *       ...
 *     }
 *   }
 * }
 */
export const getAlertSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const result = await AlertService.getAlertSummary(orgId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// GET /api/v1/alerts/:id
// ═════════════════════════════════════════════

/**
 * Obtiene el detalle completo de una alerta de optimización.
 * Valida que pertenezca a la organización del usuario autenticado.
 * Incluye la respuesta cruda del LLM (aiRawResponse) para auditores.
 *
 * Acceso: todos los roles autenticados
 */
export const getAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    const alert = await AlertService.getAlertById(id, orgId);

    res.status(200).json({
      status: 'success',
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// POST /api/v1/alerts
// ═════════════════════════════════════════════

/**
 * Crea una nueva alerta de optimización para la organización.
 *
 * Body requerido: { alertType, title, description, recommendation }
 * Body opcional:  { subscriptionId, triggeredByUserId, priority,
 *                   estimatedSavings, currency, aiModelVersion,
 *                   confidenceScore, aiRawResponse, expiresAt }
 *
 * SEGURIDAD: el organizationId siempre proviene del JWT, nunca del body.
 *
 * Acceso: ADMIN, IT_MANAGER (o sistema IA vía cron/worker)
 */
export const createAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;

    const {
      subscriptionId,
      triggeredByUserId,
      alertType,
      priority,
      title,
      description,
      recommendation,
      estimatedSavings,
      currency,
      aiModelVersion,
      confidenceScore,
      aiRawResponse,
      expiresAt,
    } = req.body as CreateAlertDto;

    const alert = await AlertService.createAlert(orgId, {
      subscriptionId,
      triggeredByUserId,
      alertType,
      priority,
      title,
      description,
      recommendation,
      estimatedSavings: estimatedSavings !== undefined ? Number(estimatedSavings) : undefined,
      currency,
      aiModelVersion,
      confidenceScore: confidenceScore !== undefined ? Number(confidenceScore) : undefined,
      aiRawResponse,
      expiresAt,
    });

    // Auditar la creación de la alerta (fire-and-forget)
    void ActivityLogService.log({
      organizationId: orgId,
      userId: req.user!.id,
      action: 'ALERT_CREATED',
      entityType: 'alert',
      entityId: alert.id,
      metadata: { alertType, priority: alert.priority, estimatedSavings, title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      status: 'success',
      message: 'Alerta de optimización registrada exitosamente.',
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// PATCH /api/v1/alerts/:id/resolve
// ═════════════════════════════════════════════

/**
 * Resuelve (acepta, descarta o completa) una alerta de optimización.
 * Implementa el ciclo Human-in-the-loop de Onniik.
 *
 * Body requerido: { status: AlertStatus }
 * Body opcional:  { resolutionNote: string }
 *
 * Estados válidos para resolver: ACCEPTED, DISMISSED, COMPLETED
 *
 * SEGURIDAD: el resolvedById siempre proviene del JWT — nunca del body.
 *
 * Acceso: ADMIN, IT_MANAGER
 *
 * @example
 * PATCH /api/v1/alerts/uuid/resolve
 * { "status": "ACCEPTED", "resolutionNote": "Se procede a cancelar las 5 licencias inactivas." }
 */
export const resolveAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const resolvedById = req.user!.id;
    const { id } = req.params as Record<string, string>;
    const { status, resolutionNote } = req.body as ResolveAlertDto;

    const result = await AlertService.resolveAlert(id, orgId, resolvedById, {
      status,
      resolutionNote,
    });

    // Auditar la resolución de la alerta (fire-and-forget)
    // Mapeo de status a ActivityAction
    const actionMap: Partial<Record<AlertStatus, 'ALERT_ACCEPTED' | 'ALERT_DISMISSED'>> = {
      ACCEPTED: 'ALERT_ACCEPTED',
      DISMISSED: 'ALERT_DISMISSED',
    };
    const auditAction = actionMap[result.transition.to as AlertStatus];
    if (auditAction) {
      void ActivityLogService.log({
        organizationId: orgId,
        userId: resolvedById,
        action: auditAction,
        entityType: 'alert',
        entityId: id,
        metadata: {
          alertTitle: result.transition.alertTitle,
          from: result.transition.from,
          to: result.transition.to,
          resolutionNote: result.transition.resolutionNote,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Alerta ${
        result.transition.to === 'ACCEPTED'
          ? 'aceptada'
          : result.transition.to === 'DISMISSED'
            ? 'descartada'
            : 'completada'
      } exitosamente.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// DELETE /api/v1/alerts/:id
// ═════════════════════════════════════════════

/**
 * Elimina físicamente una alerta de optimización.
 * Se recomienda usar DISMISSED en lugar de DELETE para preservar el historial.
 *
 * Acceso: ADMIN únicamente
 */
export const deleteAlert = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    const deleted = await AlertService.deleteAlert(id, orgId);

    res.status(200).json({
      status: 'success',
      message: `Alerta "${deleted.title}" eliminada exitosamente.`,
      data: { id: deleted.id },
    });
  } catch (error) {
    next(error);
  }
};
