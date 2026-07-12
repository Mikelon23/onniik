/**
 * alert.routes.ts
 * Definición de rutas para las alertas de optimización de Onniik.
 *
 * Base path: /api/v1/alerts
 *
 * ┌─────────┬───────────────────────┬──────────────────────────────────┐
 * │ Método  │ Ruta                  │ Roles permitidos                 │
 * ├─────────┼───────────────────────┼──────────────────────────────────┤
 * │ GET     │ /                     │ Todos (requireAuth)              │
 * │ GET     │ /summary              │ Todos (requireAuth)              │
 * │ GET     │ /:id                  │ Todos (requireAuth)              │
 * │ POST    │ /                     │ ADMIN + IT_MANAGER               │
 * │ PATCH   │ /:id/resolve          │ ADMIN + IT_MANAGER               │
 * │ DELETE  │ /:id                  │ ADMIN                            │
 * └─────────┴───────────────────────┴──────────────────────────────────┘
 *
 * Tarea 83 — /api/v1/alerts (servicio base de alertas de optimización)
 */

import { Router } from 'express';
import {
  listAlerts,
  getAlertSummary,
  getAlert,
  createAlert,
  resolveAlert,
  deleteAlert,
} from '../controllers/alert.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin, requireAdminOrItManager } from '../middlewares/rbac.middleware';

const router = Router();

// ── GET /api/v1/alerts/summary — KPIs de alertas para el Dashboard ──────────
// IMPORTANTE: debe estar ANTES de /:id para evitar que Express interprete
// "summary" como un UUID de alerta.
router.get('/summary', requireAuth, getAlertSummary);

// ── GET /api/v1/alerts — Lista paginada de alertas de la organización ────────
router.get('/', requireAuth, listAlerts);

// ── GET /api/v1/alerts/:id — Detalle de una alerta específica ────────────────
router.get('/:id', requireAuth, getAlert);

// ── POST /api/v1/alerts — Crear una nueva alerta (sistema IA o manual) ───────
router.post('/', requireAuth, requireAdminOrItManager, createAlert);

// ── PATCH /api/v1/alerts/:id/resolve — Aceptar/descartar/completar alerta ───
// Human-in-the-loop: solo ADMIN o IT_MANAGER pueden resolver alertas
router.patch('/:id/resolve', requireAuth, requireAdminOrItManager, resolveAlert);

// ── DELETE /api/v1/alerts/:id — Eliminar alerta físicamente (solo ADMIN) ─────
// Se recomienda usar PATCH /resolve con status=DISMISSED en lugar de DELETE
// para preservar el historial de auditoría (T84)
router.delete('/:id', requireAuth, requireAdmin, deleteAlert);

export default router;
