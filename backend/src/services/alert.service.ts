/**
 * alert.service.ts
 * Servicio base para el registro y gestión de alertas de optimización de Onniik.
 *
 * Responsabilidades:
 *   - Crear alertas de optimización generadas por el motor de IA o manualmente
 *   - Listar alertas de una organización con filtros y paginación
 *   - Obtener el detalle de una alerta específica
 *   - Cambiar el estado de una alerta (aceptar, descartar, completar)
 *   - Calcular KPIs de ahorro potencial para el Dashboard
 *
 * SEGURIDAD:
 *   - Todas las queries incluyen `organizationId` como filtro obligatorio (multi-tenant).
 *   - El organizationId siempre proviene del JWT (req.user), nunca del body.
 *   - Los resolvedBy/triggeredBy solo pueden ser usuarios de la misma organización.
 *
 * Tarea 83 — /api/v1/alerts
 *
 * DEPENDENCIAS FUTURAS:
 *   - T84: ActivityLog debe registrar ALERT_CREATED, ALERT_ACCEPTED, ALERT_DISMISSED
 *   - T87: Dashboard KPI usa getAlertSummary() de este servicio
 *   - T141: El motor de IA llama a createAlert() para persistir sus recomendaciones
 */

import prisma from '../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/AppError';
import { AlertType, AlertStatus, AlertPriority, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// DTOs de entrada
// ─────────────────────────────────────────────

/**
 * DTO para crear una nueva alerta de optimización.
 * Puede ser generada por el motor de IA (triggeredByUserId = null)
 * o iniciada manualmente por un ADMIN/IT_MANAGER.
 */
export interface CreateAlertDto {
  /** UUID de la suscripción SaaS asociada (opcional para alertas globales de org) */
  subscriptionId?: string;
  /** UUID del usuario que inició la alerta (null si es automática del sistema IA) */
  triggeredByUserId?: string;
  /** Tipo de oportunidad de optimización detectada */
  alertType: AlertType;
  /** Prioridad de la alerta según impacto financiero o urgencia */
  priority?: AlertPriority;
  /** Título corto de la alerta (ej. "Slack: 12 asientos inactivos") */
  title: string;
  /** Descripción detallada del problema detectado */
  description: string;
  /** Acción recomendada por el agente de IA o el administrador */
  recommendation: string;
  /** Ahorro estimado en USD/mes (calculado por la IA) */
  estimatedSavings?: number;
  /** Moneda del ahorro estimado (default: USD) */
  currency?: string;
  /** Versión del modelo IA utilizado (ej. "gpt-4o-mini", "claude-3-haiku") */
  aiModelVersion?: string;
  /** Score de confianza del modelo [0.0 – 1.0] */
  confidenceScore?: number;
  /** Respuesta cruda del LLM para trazabilidad y auditoría */
  aiRawResponse?: Record<string, unknown>;
  /** Fecha límite para actuar sobre la alerta antes de que expire */
  expiresAt?: string; // ISO 8601
}

/**
 * DTO para resolver (aceptar o descartar) una alerta.
 * La resolución la realiza un ADMIN o IT_MANAGER.
 */
export interface ResolveAlertDto {
  /** Nuevo estado de la alerta (ACCEPTED, DISMISSED o COMPLETED) */
  status: AlertStatus;
  /** Nota del administrador explicando la decisión tomada */
  resolutionNote?: string;
}

/** Filtros opcionales para listar alertas de una organización */
export interface ListAlertsFilter {
  /** Filtrar por estado de la alerta */
  status?: AlertStatus;
  /** Filtrar por tipo de optimización */
  alertType?: AlertType;
  /** Filtrar por nivel de prioridad */
  priority?: AlertPriority;
  /** Filtrar alertas de una suscripción específica */
  subscriptionId?: string;
}

// ─────────────────────────────────────────────
// Máquina de estados — transiciones válidas
// ─────────────────────────────────────────────

/**
 * Define las transiciones de estado permitidas para una alerta de optimización.
 *
 * Reglas de negocio:
 *   - COMPLETED y EXPIRED son estados terminales.
 *   - PENDING puede resolverse a ACCEPTED o DISMISSED.
 *   - ACCEPTED puede confirmarse como COMPLETED una vez ejecutada la acción.
 *   - DISMISSED es terminal — no puede reactivarse.
 *   - EXPIRED lo establece el cron job automáticamente.
 *
 * ┌──────────────┬────────────────────────────────────────┐
 * │ Estado actual│ Transiciones permitidas                │
 * ├──────────────┼────────────────────────────────────────┤
 * │ PENDING      │ ACCEPTED, DISMISSED, EXPIRED           │
 * │ ACCEPTED     │ COMPLETED, DISMISSED                   │
 * │ DISMISSED    │ (estado terminal)                      │
 * │ COMPLETED    │ (estado terminal)                      │
 * │ EXPIRED      │ (estado terminal — cron job)           │
 * └──────────────┴────────────────────────────────────────┘
 */
const VALID_ALERT_TRANSITIONS: Record<AlertStatus, AlertStatus[]> = {
  PENDING: ['ACCEPTED', 'DISMISSED', 'EXPIRED'],
  ACCEPTED: ['COMPLETED', 'DISMISSED'],
  DISMISSED: [], // estado terminal
  COMPLETED: [], // estado terminal
  EXPIRED: [], // estado terminal — solo el cron job puede establecerlo
};

// ─────────────────────────────────────────────
// Proyección segura — OptimizationAlert
// ─────────────────────────────────────────────

const ALERT_PUBLIC_SELECT = {
  id: true,
  organizationId: true,
  subscriptionId: true,
  subscription: {
    select: {
      id: true,
      saasProduct: { select: { id: true, name: true, slug: true, logoUrl: true } },
      status: true,
      totalMonthlyCost: true,
    },
  },
  triggeredByUserId: true,
  triggeredBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  alertType: true,
  priority: true,
  status: true,
  title: true,
  description: true,
  recommendation: true,
  estimatedSavings: true,
  currency: true,
  aiModelVersion: true,
  confidenceScore: true,
  // aiRawResponse excluido de la proyección pública (puede ser muy grande)
  resolvedById: true,
  resolvedBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  resolvedAt: true,
  resolutionNote: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─────────────────────────────────────────────
// AlertService
// ─────────────────────────────────────────────

export const AlertService = {
  /**
   * Lista las alertas de optimización de una organización.
   * Siempre filtra por organizationId — aislamiento multi-tenant garantizado.
   *
   * Ordenadas por prioridad descendente y luego por fecha de creación descendente,
   * para que las alertas críticas/de mayor ahorro aparezcan primero en el Dashboard.
   *
   * @param orgId  - UUID de la organización (del JWT)
   * @param filter - Filtros opcionales por status, tipo, prioridad o subscripción
   * @param page   - Número de página (1-indexed, default: 1)
   * @param limit  - Registros por página (default: 20, máx: 100)
   */
  async listAlerts(orgId: string, filter: ListAlertsFilter = {}, page = 1, limit = 20) {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    // Construir condición WHERE dinámica
    const where: Record<string, unknown> = { organizationId: orgId };
    if (filter.status) where.status = filter.status;
    if (filter.alertType) where.alertType = filter.alertType;
    if (filter.priority) where.priority = filter.priority;
    if (filter.subscriptionId) where.subscriptionId = filter.subscriptionId;

    // Orden: CRITICAL → HIGH → MEDIUM → LOW, y dentro del mismo priority, más reciente primero
    const priorityOrder: AlertPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    const [alerts, total] = await prisma.$transaction([
      prisma.optimizationAlert.findMany({
        where,
        select: ALERT_PUBLIC_SELECT,
        orderBy: [
          // Prisma no soporta orden por enum nativo; ordenamos por createdAt desc como proxy
          // El orden real por prioridad se aplica en el frontend o en una query raw futura (T88)
          { createdAt: 'desc' },
        ],
        skip,
        take: safeLimit,
      }),
      prisma.optimizationAlert.count({ where }),
    ]);

    // Ordenar en memoria por prioridad (estrategia temporal hasta T88 con optimizador de queries)
    const sortedAlerts = alerts.sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    });

    return { alerts: sortedAlerts, total, page, limit: safeLimit };
  },

  /**
   * Obtiene el detalle completo de una alerta de optimización.
   * Valida que pertenezca a la organización del usuario autenticado.
   *
   * @param alertId - UUID de la alerta
   * @param orgId   - UUID de la organización (del JWT)
   * @throws {NotFoundError} Si la alerta no existe o pertenece a otra organización
   */
  async getAlertById(alertId: string, orgId: string) {
    const alert = await prisma.optimizationAlert.findUnique({
      where: { id: alertId },
      select: {
        ...ALERT_PUBLIC_SELECT,
        // Incluir respuesta raw del LLM en el detalle individual (para auditores)
        aiRawResponse: true,
      },
    });

    if (!alert || alert.organizationId !== orgId) {
      throw new NotFoundError('La alerta de optimización solicitada no existe.');
    }

    return alert;
  },

  /**
   * Crea una nueva alerta de optimización para la organización.
   *
   * Validaciones:
   *   - La suscripción (si se especifica) debe pertenecer a la organización
   *   - El triggeredByUserId (si se especifica) debe pertenecer a la organización
   *   - El confidenceScore debe estar en el rango [0.0, 1.0]
   *
   * Puede ser invocado por:
   *   - El motor de IA (triggeredByUserId = undefined/null)
   *   - Un administrador manualmente (triggeredByUserId = UUID del usuario)
   *
   * @param orgId - UUID de la organización (del JWT)
   * @param dto   - Datos de la nueva alerta
   * @throws {BadRequestError} Si los datos son inválidos o las referencias no existen
   */
  async createAlert(orgId: string, dto: CreateAlertDto) {
    // 1. Validar que la suscripción (si se especificó) pertenece a la organización
    if (dto.subscriptionId) {
      const subscription = await prisma.saaSSubscription.findUnique({
        where: { id: dto.subscriptionId },
        select: { id: true, organizationId: true },
      });

      if (!subscription || subscription.organizationId !== orgId) {
        throw new BadRequestError(
          'La suscripción especificada no existe o no pertenece a esta organización.'
        );
      }
    }

    // 2. Validar que el usuario que disparó la alerta (si se especificó) pertenece a la org
    if (dto.triggeredByUserId) {
      const triggerUser = await prisma.user.findFirst({
        where: { id: dto.triggeredByUserId, organizationId: orgId },
        select: { id: true },
      });

      if (!triggerUser) {
        throw new BadRequestError(
          'El usuario que inició la alerta no pertenece a esta organización.'
        );
      }
    }

    // 3. Validar rango del confidenceScore si se proporciona
    if (dto.confidenceScore !== undefined) {
      if (dto.confidenceScore < 0 || dto.confidenceScore > 1) {
        throw new BadRequestError('El confidenceScore debe ser un valor entre 0.0 y 1.0.');
      }
    }

    const alert = await prisma.optimizationAlert.create({
      data: {
        organizationId: orgId,
        subscriptionId: dto.subscriptionId ?? null,
        triggeredByUserId: dto.triggeredByUserId ?? null,
        alertType: dto.alertType,
        priority: dto.priority ?? 'MEDIUM',
        status: 'PENDING', // Las alertas siempre inician en estado PENDING
        title: dto.title.trim(),
        description: dto.description.trim(),
        recommendation: dto.recommendation.trim(),
        estimatedSavings: dto.estimatedSavings ?? null,
        currency: dto.currency ?? 'USD',
        aiModelVersion: dto.aiModelVersion ?? null,
        confidenceScore: dto.confidenceScore ?? null,
        // Prisma requiere Prisma.JsonNull para campos JSON nullable
        aiRawResponse:
          dto.aiRawResponse !== undefined
            ? (dto.aiRawResponse as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      select: ALERT_PUBLIC_SELECT,
    });

    return alert;
  },

  /**
   * Resuelve una alerta de optimización — acepta, descarta o completa una acción.
   *
   * Valida la transición de estado según la máquina de estados definida.
   * Registra quién resolvió la alerta (resolvedById) y cuándo (resolvedAt).
   *
   * A diferencia de createAlert (que puede ser del sistema IA),
   * resolveAlert SIEMPRE requiere un usuario humano identificado (Human-in-the-loop).
   *
   * @param alertId      - UUID de la alerta a resolver
   * @param orgId        - UUID de la organización (del JWT)
   * @param resolvedById - UUID del usuario que resuelve la alerta (del JWT)
   * @param dto          - Nuevo estado y nota de resolución opcional
   *
   * @throws {NotFoundError}   Si la alerta no existe o es de otra org
   * @throws {BadRequestError} Si la transición de estado es inválida
   * @throws {ForbiddenError}  Si el resolvedBy no pertenece a la organización
   */
  async resolveAlert(alertId: string, orgId: string, resolvedById: string, dto: ResolveAlertDto) {
    // 1. Verificar existencia y pertenencia a la org
    const existing = await prisma.optimizationAlert.findUnique({
      where: { id: alertId },
      select: {
        id: true,
        organizationId: true,
        status: true,
        title: true,
      },
    });

    if (!existing || existing.organizationId !== orgId) {
      throw new NotFoundError('La alerta de optimización solicitada no existe.');
    }

    // 2. Validar que el usuario que resuelve pertenece a la organización
    const resolver = await prisma.user.findFirst({
      where: { id: resolvedById, organizationId: orgId },
      select: { id: true },
    });

    if (!resolver) {
      throw new ForbiddenError(
        'El usuario no tiene permisos para resolver alertas en esta organización.'
      );
    }

    const currentStatus = existing.status;
    const newStatus = dto.status;

    // 3. Validar que no sea el mismo estado (idempotencia)
    if (currentStatus === newStatus) {
      throw new BadRequestError(
        `La alerta ya se encuentra en estado ${currentStatus}. No se realizaron cambios.`
      );
    }

    // 4. Validar transición según la máquina de estados
    const allowedTransitions = VALID_ALERT_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      const isTerminal = allowedTransitions.length === 0;
      if (isTerminal) {
        throw new BadRequestError(
          `La alerta está en estado ${currentStatus} (estado terminal). No puede cambiar de estado.`
        );
      }
      throw new BadRequestError(
        `Transición de estado inválida: ${currentStatus} → ${newStatus}. ` +
          `Transiciones permitidas desde ${currentStatus}: ${allowedTransitions.join(', ')}.`
      );
    }

    // 5. Ejecutar la resolución
    const resolvedAlert = await prisma.optimizationAlert.update({
      where: { id: alertId },
      data: {
        status: newStatus,
        resolvedById,
        resolvedAt: new Date(),
        resolutionNote: dto.resolutionNote?.trim() ?? null,
      },
      select: ALERT_PUBLIC_SELECT,
    });

    return {
      alert: resolvedAlert,
      transition: {
        from: currentStatus,
        to: newStatus,
        alertTitle: existing.title,
        resolvedById,
        resolutionNote: dto.resolutionNote ?? null,
      },
    };
  },

  /**
   * Elimina físicamente una alerta de optimización.
   * Solo disponible para ADMIN. Valida pertenencia a la org.
   *
   * Nota: en producción se recomienda preferir DISMISSED sobre eliminación física
   * para mantener el historial de auditoría (se registrará en ActivityLog T84).
   *
   * @param alertId - UUID de la alerta a eliminar
   * @param orgId   - UUID de la organización (del JWT)
   * @throws {NotFoundError} Si la alerta no existe o es de otra org
   */
  async deleteAlert(alertId: string, orgId: string) {
    const existing = await prisma.optimizationAlert.findUnique({
      where: { id: alertId },
      select: { id: true, organizationId: true, title: true },
    });

    if (!existing || existing.organizationId !== orgId) {
      throw new NotFoundError('La alerta de optimización solicitada no existe.');
    }

    await prisma.optimizationAlert.delete({ where: { id: alertId } });

    return { id: alertId, title: existing.title };
  },

  /**
   * Retorna un resumen de KPIs de alertas para el Dashboard principal.
   *
   * Métricas calculadas:
   *   - Total de alertas PENDING (sin revisar)
   *   - Ahorro potencial estimado total de alertas PENDING
   *   - Distribución por tipo de alerta
   *   - Distribución por prioridad
   *   - Total de alertas aceptadas y completadas (ahorro confirmado)
   *
   * Soportado por el índice compuesto:
   *   @@index([organizationId, status, estimatedSavings], "optimization_alerts_dashboard_idx")
   *
   * @param orgId - UUID de la organización (del JWT)
   */
  async getAlertSummary(orgId: string) {
    // Query 1: agrupar por status con suma de ahorros estimados
    const byStatus = await prisma.optimizationAlert.groupBy({
      by: ['status'],
      where: { organizationId: orgId },
      _count: { id: true },
      _sum: { estimatedSavings: true },
    });

    // Query 2: agrupar por tipo de alerta (solo PENDING)
    const byType = await prisma.optimizationAlert.groupBy({
      by: ['alertType'],
      where: { organizationId: orgId, status: 'PENDING' },
      _count: { id: true },
      _sum: { estimatedSavings: true },
    });

    // Query 3: agrupar por prioridad (solo PENDING)
    const byPriority = await prisma.optimizationAlert.groupBy({
      by: ['priority'],
      where: { organizationId: orgId, status: 'PENDING' },
      _count: { id: true },
    });

    // Construir mapa de resultados por estado
    const statusMap: Record<string, { count: number; estimatedSavings: number }> = {};

    for (const row of byStatus) {
      statusMap[row.status] = {
        count: row._count.id,
        estimatedSavings: Number(row._sum.estimatedSavings ?? 0),
      };
    }

    // KPIs globales para el Dashboard
    const pendingStats = statusMap['PENDING'] ?? { count: 0, estimatedSavings: 0 };
    const acceptedStats = statusMap['ACCEPTED'] ?? { count: 0, estimatedSavings: 0 };
    const completedStats = statusMap['COMPLETED'] ?? { count: 0, estimatedSavings: 0 };
    const dismissedStats = statusMap['DISMISSED'] ?? { count: 0, estimatedSavings: 0 };
    const expiredStats = statusMap['EXPIRED'] ?? { count: 0, estimatedSavings: 0 };

    const totalAlerts = Object.values(statusMap).reduce((acc, s) => acc + s.count, 0);

    return {
      summary: {
        byStatus: statusMap,
        byType: byType.map((row) => ({
          alertType: row.alertType,
          count: row._count.id,
          estimatedSavings: Number(row._sum.estimatedSavings ?? 0),
        })),
        byPriority: byPriority.map((row) => ({
          priority: row.priority,
          count: row._count.id,
        })),
      },
      kpis: {
        totalAlerts,
        pendingCount: pendingStats.count,
        totalPotentialSavings: pendingStats.estimatedSavings,
        acceptedCount: acceptedStats.count,
        completedCount: completedStats.count,
        dismissedCount: dismissedStats.count,
        expiredCount: expiredStats.count,
        confirmedSavings: completedStats.estimatedSavings, // Ahorro ya confirmado
      },
    };
  },
};
