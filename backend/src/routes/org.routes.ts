/**
 * org.routes.ts
 * Definición de rutas para la gestión de organizaciones en Onniik.
 *
 * Base path: /api/v1/orgs
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Método  │ Ruta                 │ Middleware                │ Descripción │
 * ├──────────┼──────────────────────┼───────────────────────────┼─────────────┤
 * │  GET     │ /me                  │ requireAuth               │ Perfil de org del usuario │
 * │  PATCH   │ /me                  │ requireAuth + requireAdmin │ Actualizar nombre de org  │
 * │  GET     │ /me/members          │ requireAuth + requireAdminOrItManager │ Listar miembros │
 * └──────────┴──────────────────────┴───────────────────────────┴─────────────┘
 *
 * Tarea 80 — /api/v1/orgs
 */

import { Router } from 'express';
import { getMyOrg, updateMyOrg, getMyOrgMembers } from '../controllers/org.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin, requireAdminOrItManager } from '../middlewares/rbac.middleware';

const router = Router();

// ── GET /api/v1/orgs/me ──────────────────────────────────────────────────────
// Obtiene el perfil de la organización del usuario autenticado.
// Accesible por todos los roles autenticados (ADMIN, IT_MANAGER, READER).
router.get('/me', requireAuth, getMyOrg);

// ── PATCH /api/v1/orgs/me ───────────────────────────────────────────────────
// Actualiza los metadatos de la organización (solo nombre por ahora).
// Restringido al rol ADMIN: es una operación administrativa crítica.
router.patch('/me', requireAuth, requireAdmin, updateMyOrg);

// ── GET /api/v1/orgs/me/members ─────────────────────────────────────────────
// Lista todos los miembros (usuarios) de la organización con sus roles.
// Accesible por ADMIN e IT_MANAGER. READER no tiene visibilidad del directorio.
router.get('/me/members', requireAuth, requireAdminOrItManager, getMyOrgMembers);

export default router;
