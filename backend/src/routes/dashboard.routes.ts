/**
 * dashboard.routes.ts
 * Rutas para la obtención de métricas consolidadas del Dashboard de Onniik.
 *
 * Base path: /api/v1/dashboard
 */

import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';
import { Permission } from '../types/rbac.types';

const router = Router();

// ── GET /api/v1/dashboard ────────────────────────────────────────────────────
// Retorna las métricas y KPIs consolidados para el Dashboard principal.
// Acceso: Todos los usuarios de la organización (ADMIN, IT_MANAGER, READER)
// ya que todos tienen asignado el permiso VIEW_DASHBOARD.
router.get('/', requireAuth, requirePermission(Permission.VIEW_DASHBOARD), getDashboard);

export default router;
