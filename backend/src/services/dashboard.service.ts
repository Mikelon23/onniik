/**
 * dashboard.service.ts
 * Servicio para la consolidación de métricas y KPIs rápidos del Dashboard principal.
 *
 * Responsabilidades:
 *   - Obtener en una sola llamada el estado financiero y operativo de SaaS (suscripciones).
 *   - Consolidar las oportunidades de optimización y ahorro detectadas por la IA (alertas).
 *   - Devolver KPIs agregados y rankings en memoria para optimizar el rendimiento.
 *
 * SEGURIDAD:
 *   - Requiere obligatoriamente filtrar por organizationId (multi-tenant).
 */

import prisma from '../config/db';
import { SubscriptionStatus, AlertStatus, AlertPriority, SaaSCategory } from '@prisma/client';

export const DashboardService = {
  /**
   * Obtiene todos los KPIs consolidados, distribuciones y rankings del Dashboard para una organización.
   *
   * @param orgId - UUID de la organización
   */
  async getDashboardData(orgId: string) {
    // 1. Obtener todas las suscripciones de la organización
    const subscriptions = await prisma.saaSSubscription.findMany({
      where: { organizationId: orgId },
      include: {
        saasProduct: {
          select: {
            name: true,
            logoUrl: true,
            category: true,
          },
        },
      },
    });

    // 2. Obtener todas las alertas de optimización de la organización
    const alerts = await prisma.optimizationAlert.findMany({
      where: { organizationId: orgId },
    });

    // ── PROCESAMIENTO DE SUSCRIPCIONES ──

    // Inicializar mapa de estados pre-poblado con ceros
    const subStatusMap: Record<SubscriptionStatus, { count: number; totalMonthlyCost: number }> = {
      ACTIVE: { count: 0, totalMonthlyCost: 0 },
      INACTIVE: { count: 0, totalMonthlyCost: 0 },
      CANCELLED: { count: 0, totalMonthlyCost: 0 },
      PENDING_REVIEW: { count: 0, totalMonthlyCost: 0 },
      SHADOW_IT: { count: 0, totalMonthlyCost: 0 },
    };

    const categoryMap: Partial<Record<SaaSCategory, { count: number; totalMonthlyCost: number }>> =
      {};

    let totalMonthlySpend = 0;
    const activeSubList: typeof subscriptions = [];

    for (const sub of subscriptions) {
      const status = sub.status;
      const cost = Number(sub.totalMonthlyCost ?? 0);

      // Agrupar por estado
      if (subStatusMap[status]) {
        subStatusMap[status].count += 1;
        subStatusMap[status].totalMonthlyCost = Number(
          (subStatusMap[status].totalMonthlyCost + cost).toFixed(2)
        );
      }

      // Agrupar por categoría (solo para suscripciones activas y Shadow IT, o activas en general)
      // Tradicionalmente, spend se calcula para ACTIVE. Vamos a calcular distribución de gasto en ACTIVE.
      if (status === 'ACTIVE' || status === 'SHADOW_IT') {
        const category = sub.saasProduct.category;
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, totalMonthlyCost: 0 };
        }
        const catData = categoryMap[category]!;
        catData.count += 1;
        catData.totalMonthlyCost = Number((catData.totalMonthlyCost + cost).toFixed(2));
      }

      if (status === 'ACTIVE') {
        totalMonthlySpend = Number((totalMonthlySpend + cost).toFixed(2));
        activeSubList.push(sub);
      }
    }

    // Convertir mapa de categorías a array ordenado por costo desc
    const byCategory = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category: category as SaaSCategory,
        count: data!.count,
        totalMonthlyCost: data!.totalMonthlyCost,
      }))
      .sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost);

    // Obtener las 5 suscripciones activas más costosas
    const topExpensive = activeSubList
      .map((sub) => ({
        id: sub.id,
        productName: sub.saasProduct.name,
        logoUrl: sub.saasProduct.logoUrl,
        status: sub.status,
        totalMonthlyCost: Number(sub.totalMonthlyCost ?? 0),
        seatCount: sub.seatCount,
        activeSeats: sub.activeSeats,
      }))
      .sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost)
      .slice(0, 5);

    // ── PROCESAMIENTO DE ALERTAS ──

    // Inicializar mapa de estados de alerta pre-poblado con ceros
    const alertStatusMap: Record<AlertStatus, { count: number; estimatedSavings: number }> = {
      PENDING: { count: 0, estimatedSavings: 0 },
      ACCEPTED: { count: 0, estimatedSavings: 0 },
      DISMISSED: { count: 0, estimatedSavings: 0 },
      COMPLETED: { count: 0, estimatedSavings: 0 },
      EXPIRED: { count: 0, estimatedSavings: 0 },
    };

    // Inicializar mapa de prioridades para alertas pendientes
    const alertPriorityMap: Record<AlertPriority, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    let totalPotentialSavings = 0;
    let confirmedSavings = 0;
    const pendingAlertList: typeof alerts = [];

    for (const alert of alerts) {
      const status = alert.status;
      const savings = Number(alert.estimatedSavings ?? 0);

      // Agrupar por estado de alerta
      if (alertStatusMap[status]) {
        alertStatusMap[status].count += 1;
        alertStatusMap[status].estimatedSavings = Number(
          (alertStatusMap[status].estimatedSavings + savings).toFixed(2)
        );
      }

      if (status === 'PENDING') {
        totalPotentialSavings = Number((totalPotentialSavings + savings).toFixed(2));
        alertPriorityMap[alert.priority] += 1;
        pendingAlertList.push(alert);
      } else if (status === 'COMPLETED') {
        confirmedSavings = Number((confirmedSavings + savings).toFixed(2));
      }
    }

    // Obtener las 5 alertas pendientes más prioritarias/de mayor ahorro
    const priorityWeight: Record<AlertPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const topPending = pendingAlertList
      .map((alert) => ({
        id: alert.id,
        title: alert.title,
        alertType: alert.alertType,
        priority: alert.priority,
        estimatedSavings: Number(alert.estimatedSavings ?? 0),
        createdAt: alert.createdAt,
      }))
      .sort((a, b) => {
        // Ordenar primero por prioridad (mayor peso primero)
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff !== 0) return diff;
        // Si tienen igual prioridad, ordenar por ahorro estimado (mayor primero)
        return b.estimatedSavings - a.estimatedSavings;
      })
      .slice(0, 5);

    // ── KPI CONSOLIDADOS DE RETORNO ──
    return {
      kpis: {
        totalMonthlySpend,
        totalPotentialSavings,
        confirmedSavings,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subStatusMap['ACTIVE'].count,
        shadowItCount: subStatusMap['SHADOW_IT'].count,
        pendingReviewCount: subStatusMap['PENDING_REVIEW'].count,
        totalAlerts: alerts.length,
        pendingAlertsCount: alertStatusMap['PENDING'].count,
      },
      subscriptions: {
        byStatus: subStatusMap,
        byCategory,
        topExpensive,
      },
      alerts: {
        byStatus: alertStatusMap,
        byPriority: alertPriorityMap,
        topPending,
      },
    };
  },
};
