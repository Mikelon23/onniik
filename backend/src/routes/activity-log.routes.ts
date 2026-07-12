/**
 * activity-log.routes.ts
 * Definición de rutas para el historial de auditoría de Onniik.
 *
 * Base path: /api/v1/logs
 *
 * Los logs son de solo LECTURA vía API pública.
 * La escritura ocurre internamente desde otros servicios.
 *
 * ┌─────────┬──────────────────┬──────────────────────────────────┐
 * │ Método  │ Ruta             │ Roles permitidos                 │
 * ├─────────┼──────────────────┼──────────────────────────────────┤
 * │ GET     │ /summary         │ ADMIN + IT_MANAGER               │
 * │ GET     │ /                │ ADMIN + IT_MANAGER               │
 * │ GET     │ /:id             │ ADMIN + IT_MANAGER               │
 * └─────────┴──────────────────┴──────────────────────────────────┘
 *
 * NOTA: READER no tiene acceso al historial de auditoría
 * por política de seguridad (RBAC — Permission.VIEW_ACTIVITY_LOGS).
 *
 * Tarea 84 — /api/v1/logs
 */

import { Router } from 'express';
import { getLogSummary, listLogs, getLog } from '../controllers/activity-log.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireCanViewLogs } from '../middlewares/rbac.middleware';

const router = Router();

// ── GET /api/v1/logs/summary — Resumen estadístico de actividad ──────────────
// IMPORTANTE: debe estar ANTES de /:id para que Express no lo interprete como UUID
router.get('/summary', requireAuth, requireCanViewLogs, getLogSummary);

// ── GET /api/v1/logs — Lista paginada de logs con filtros ────────────────────
router.get('/', requireAuth, requireCanViewLogs, listLogs);

// ── GET /api/v1/logs/:id — Detalle de un log específico ─────────────────────
router.get('/:id', requireAuth, requireCanViewLogs, getLog);

export default router;
