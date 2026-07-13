/**
 * dashboard.controller.ts
 * Controlador para la obtención de métricas consolidadas del Dashboard de Onniik.
 *
 * Tarea 87: Dashboard KPIs de Ahorro.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { DashboardService } from '../services/dashboard.service';

/**
 * Obtiene el resumen consolidado de KPIs de suscripciones y alertas para la organización del usuario.
 *
 * GET /api/v1/dashboard
 */
export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;

    const data = await DashboardService.getDashboardData(orgId);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
