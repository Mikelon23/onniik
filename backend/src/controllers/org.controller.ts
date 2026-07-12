/**
 * org.controller.ts
 * Controladores HTTP para la gestión de organizaciones en Onniik.
 *
 * Endpoints implementados (Tarea 80):
 *   GET    /api/v1/orgs/me           — Perfil de la organización del usuario autenticado
 *   PATCH  /api/v1/orgs/me           — Actualizar datos de la organización (solo ADMIN)
 *   GET    /api/v1/orgs/me/members   — Listar miembros de la organización
 *
 * Todos los endpoints requieren autenticación JWT previa (requireAuth).
 * El control de roles se aplica en la capa de rutas (org.routes.ts).
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { OrgService, UpdateOrgDto } from '../services/org.service';
import { BadRequestError } from '../errors/AppError';

// ─────────────────────────────────────────────
// GET /api/v1/orgs/me
// ─────────────────────────────────────────────

/**
 * Retorna el perfil público de la organización del usuario autenticado.
 *
 * - Requiere: JWT válido (requireAuth)
 * - Roles permitidos: ADMIN, IT_MANAGER, READER (todos los autenticados)
 *
 * @example
 * // Request
 * GET /api/v1/orgs/me
 * Cookie: token=<jwt>
 *
 * // Response 200
 * {
 *   "status": "success",
 *   "data": {
 *     "organization": {
 *       "id": "...",
 *       "name": "Acme Corporation",
 *       "googleCustomerId": "C_acme123",
 *       "memberCount": 3,
 *       "createdAt": "...",
 *       "updatedAt": "..."
 *     }
 *   }
 * }
 */
export const getMyOrg = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user es garantizado por requireAuth (middleware previo)
    const organizationId = req.user!.organizationId;

    const organization = await OrgService.getOrgById(organizationId);

    res.status(200).json({
      status: 'success',
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/v1/orgs/me
// ─────────────────────────────────────────────

/**
 * Actualiza los metadatos de la organización del usuario autenticado.
 * Solo el rol ADMIN puede ejecutar esta operación.
 *
 * Campos actualizables:
 *   - name (string): nuevo nombre comercial de la organización
 *
 * Validaciones:
 *   - Al menos un campo actualizable debe estar presente en el body
 *   - El nombre no puede ser una cadena vacía o solo espacios
 *
 * @example
 * // Request
 * PATCH /api/v1/orgs/me
 * Cookie: token=<jwt_admin>
 * Body: { "name": "Nueva Empresa S.A." }
 *
 * // Response 200
 * {
 *   "status": "success",
 *   "data": { "organization": { ... } }
 * }
 */
export const updateMyOrg = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const { name } = req.body as UpdateOrgDto;

    // ── Validación: al menos un campo debe estar presente ─────────────
    if (name === undefined) {
      throw new BadRequestError('Se debe proporcionar al menos un campo para actualizar: name.');
    }

    // ── Validación: el nombre no puede ser vacío ────────────────────────
    if (typeof name === 'string' && name.trim().length === 0) {
      throw new BadRequestError('El nombre de la organización no puede estar vacío.');
    }

    const organization = await OrgService.updateOrg(organizationId, { name });

    res.status(200).json({
      status: 'success',
      message: 'Organización actualizada exitosamente.',
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/v1/orgs/me/members
// ─────────────────────────────────────────────

/**
 * Lista todos los miembros de la organización del usuario autenticado.
 * Incluye el nombre, email, rol y fecha de incorporación de cada miembro.
 *
 * - Requiere: JWT válido (requireAuth)
 * - Roles permitidos: ADMIN, IT_MANAGER (no accesible para READER)
 *
 * @example
 * // Request
 * GET /api/v1/orgs/me/members
 * Cookie: token=<jwt_admin_or_it_manager>
 *
 * // Response 200
 * {
 *   "status": "success",
 *   "data": {
 *     "members": [
 *       { "id": "...", "name": "Alice Admin", "email": "...", "role": "ADMIN", "joinedAt": "..." },
 *       { "id": "...", "name": "Bob IT",      "email": "...", "role": "IT_MANAGER", "joinedAt": "..." }
 *     ],
 *     "total": 2
 *   }
 * }
 */
export const getMyOrgMembers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;

    const members = await OrgService.getOrgMembers(organizationId);

    res.status(200).json({
      status: 'success',
      data: {
        members,
        total: members.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
