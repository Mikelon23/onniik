/**
 * org.routes.ts
 * Definición de rutas para la gestión de organizaciones en Onniik.
 *
 * Base path: /api/v1/orgs
 *
 * ┌─────────┬───────────────────────┬───────────────────────────┬────────────────────────────────┐
 * │ Método  │ Ruta                  │ Middleware                │ Descripción                    │
 * ├─────────┼───────────────────────┼───────────────────────────┼────────────────────────────────┤
 * │ GET     │ /me                   │ requireAuth               │ Perfil de org del usuario       │
 * │ PATCH   │ /me                   │ requireAuth + ADMIN       │ Actualizar nombre de org        │
 * │ GET     │ /me/members           │ requireAuth + ADMIN/ITM   │ Listar miembros                 │
 * │ POST    │ /invite               │ requireAuth + ADMIN       │ Invitar nuevo miembro (T85)     │
 * └─────────┴───────────────────────┴───────────────────────────┴────────────────────────────────┘
 *
 * Tareas 80, 85 — /api/v1/orgs
 */

import { Router } from 'express';
import {
  getMyOrg,
  updateMyOrg,
  getMyOrgMembers,
  inviteMember,
  acceptOrgInvite,
} from '../controllers/org.controller';
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

// ── POST /api/v1/orgs/invite ─────────────────────────────────────────────────
// Invita a un nuevo miembro a la organización creando su cuenta con una
// contraseña temporal y un token de invitación (72h) para T86.
// IMPORTANTE: debe ir ANTES de rutas dinámicas /me/* para evitar conflictos.
// Acceso: solo ADMIN.
router.post('/invite', requireAuth, requireAdmin, inviteMember);

// ── POST /api/v1/orgs/invite/accept ──────────────────────────────────────────
// Acepta la invitación de un miembro, establece su contraseña definitiva
// e inicia sesión de forma automática.
// Acceso: Público (el token de invitación se pasa en el body).
router.post('/invite/accept', acceptOrgInvite);

export default router;
