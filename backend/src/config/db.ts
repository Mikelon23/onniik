import { PrismaClient, Prisma, AlertStatus, AlertType, AlertPriority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Cliente base interno
const baseClient = new PrismaClient({ adapter });

// Cliente extendido para optimización de consultas (Tarea 88)
interface RawAlert {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  triggeredByUserId: string | null;
  alertType: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  description: string;
  recommendation: string;
  estimatedSavings: string | number | null;
  currency: string;
  aiModelVersion: string | null;
  confidenceScore: number | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedBy_id: string | null;
  resolvedBy_name: string | null;
  resolvedBy_email: string | null;
  resolvedBy_role: string | null;
}

export const prisma = baseClient.$extends({
  client: {
    /**
     * Obtiene de forma paralela y optimizada las suscripciones y alertas de una organización,
     * utilizando proyecciones estrictas (select) para evitar la carga de campos grandes.
     */
    async getDashboardMetrics(orgId: string) {
      const [subscriptions, alerts] = await Promise.all([
        baseClient.saaSSubscription.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            status: true,
            totalMonthlyCost: true,
            seatCount: true,
            activeSeats: true,
            saasProduct: {
              select: {
                name: true,
                logoUrl: true,
                category: true,
              },
            },
          },
        }),
        baseClient.optimizationAlert.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            title: true,
            alertType: true,
            priority: true,
            status: true,
            estimatedSavings: true,
            createdAt: true,
          },
        }),
      ]);

      return { subscriptions, alerts };
    },
  },
  model: {
    optimizationAlert: {
      /**
       * Lista alertas de una organización aplicando filtros y ordenándolas nativamente en BD
       * por prioridad (CRITICAL -> HIGH -> MEDIUM -> LOW) y luego por fecha de creación desc.
       */
      async findManySortedByPriority(
        orgId: string,
        filter: {
          status?: AlertStatus;
          alertType?: AlertType;
          priority?: AlertPriority;
          subscriptionId?: string;
        } = {},
        skip = 0,
        take = 20
      ) {
        const conditions: string[] = ['a.organization_id::text = $1'];
        const params: unknown[] = [orgId];

        if (filter.status) {
          params.push(filter.status);
          conditions.push(`a.status = $${params.length}`);
        }
        if (filter.alertType) {
          params.push(filter.alertType);
          conditions.push(`a.alert_type = $${params.length}`);
        }
        if (filter.priority) {
          params.push(filter.priority);
          conditions.push(`a.priority = $${params.length}`);
        }
        if (filter.subscriptionId) {
          params.push(filter.subscriptionId);
          conditions.push(`a.subscription_id::text = $${params.length}`);
        }

        const whereClause = conditions.join(' AND ');

        // Añadir límite y offset
        params.push(take);
        const limitParam = `$${params.length}`;
        params.push(skip);
        const offsetParam = `$${params.length}`;

        const sql = `
          SELECT 
            a.id,
            a.organization_id as "organizationId",
            a.subscription_id as "subscriptionId",
            a.triggered_by_user_id as "triggeredByUserId",
            a.alert_type as "alertType",
            a.priority,
            a.status,
            a.title,
            a.description,
            a.recommendation,
            a.estimated_savings as "estimatedSavings",
            a.currency,
            a.ai_model_version as "aiModelVersion",
            a.confidence_score as "confidenceScore",
            a.resolved_by_id as "resolvedById",
            a.resolved_at as "resolvedAt",
            a.resolution_note as "resolutionNote",
            a.expires_at as "expiresAt",
            a.created_at as "createdAt",
            a.updated_at as "updatedAt",
            u.id as "resolvedBy_id",
            u.name as "resolvedBy_name",
            u.email as "resolvedBy_email",
            u.role as "resolvedBy_role"
          FROM optimization_alerts a
          LEFT JOIN users u ON a.resolved_by_id = u.id
          WHERE ${whereClause}
          ORDER BY 
            CASE a.priority
              WHEN 'CRITICAL' THEN 1
              WHEN 'HIGH' THEN 2
              WHEN 'MEDIUM' THEN 3
              WHEN 'LOW' THEN 4
              ELSE 5
            END ASC,
            a.created_at DESC
          LIMIT ${limitParam} OFFSET ${offsetParam}
        `;

        const alertsRaw = await baseClient.$queryRawUnsafe<RawAlert[]>(sql, ...params);

        return alertsRaw.map((alert) => ({
          id: alert.id,
          organizationId: alert.organizationId,
          subscriptionId: alert.subscriptionId,
          triggeredByUserId: alert.triggeredByUserId,
          alertType: alert.alertType,
          priority: alert.priority,
          status: alert.status,
          title: alert.title,
          description: alert.description,
          recommendation: alert.recommendation,
          estimatedSavings:
            alert.estimatedSavings !== null ? new Prisma.Decimal(alert.estimatedSavings) : null,
          currency: alert.currency,
          aiModelVersion: alert.aiModelVersion,
          confidenceScore: alert.confidenceScore !== null ? Number(alert.confidenceScore) : null,
          resolvedById: alert.resolvedById,
          resolvedBy: alert.resolvedBy_id
            ? {
                id: alert.resolvedBy_id,
                name: alert.resolvedBy_name,
                email: alert.resolvedBy_email,
                role: alert.resolvedBy_role,
              }
            : null,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
          resolutionNote: alert.resolutionNote,
          expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : null,
          createdAt: new Date(alert.createdAt),
          updatedAt: new Date(alert.updatedAt),
        }));
      },
    },
  },
});

export default prisma;
