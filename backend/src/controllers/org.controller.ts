/**
 * org.controller.ts
 * Controladores HTTP para la gestión de organizaciones en Onniik.
 *
 * Endpoints implementados (Tarea 80):
 *   GET    /api/v1/orgs/me           — Perfil de la organización del usuario autenticado
 *   PATCH  /api/v1/orgs/me           — Actualizar datos de la organización (solo ADMIN)
 *   GET    /api/v1/orgs/me/members   — Listar miembros de la organización
 *
 * Endpoints añadidos (Tarea 85):
 *   POST   /api/v1/orgs/invite       — Invitar nuevo miembro a la organización
 *
 * Todos los endpoints requieren autenticación JWT previa (requireAuth).
 * El control de roles se aplica en la capa de rutas (org.routes.ts).
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { OrgService, UpdateOrgDto, InviteMemberDto } from '../services/org.service';
import { BadRequestError } from '../errors/AppError';
import { Role } from '@prisma/client';
import { ActivityLogService } from '../services/activity-log.service';

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

// ─────────────────────────────────────────────
// POST /api/v1/orgs/invite
// ─────────────────────────────────────────────

/**
 * Invita a un nuevo miembro a la organización del usuario autenticado.
 *
 * FLUJO:
 *   1. Valida que el email no esté ya registrado.
 *   2. Genera una contraseña temporal segura.
 *   3. Crea el usuario con el rol especificado (default: READER).
 *   4. Genera un token JWT de invitación (72h) para que el invitado
 *      establezca su contraseña definitiva en T86.
 *   5. Audita la acción (MEMBER_INVITED en ActivityLog).
 *
 * Body requerido: { email: string }
 * Body opcional:  { name: string, role: Role }
 *
 * SEGURIDAD:
 *   - Solo ADMIN puede invitar nuevos miembros.
 *   - El organizationId siempre proviene del JWT.
 *   - La contraseña temporal se devuelve UNA SOLA VEZ en la respuesta.
 *
 * NOTA PROVISIONAL (hasta T91-92):
 *   La contraseña temporal y el inviteToken se devuelven en la respuesta
 *   para que el admin pueda compartirlos con el invitado manualmente.
 *   Cuando el servicio de email esté disponible, se enviará automáticamente.
 *
 * Acceso: ADMIN únicamente
 *
 * @example
 * POST /api/v1/orgs/invite
 * { "email": "nuevo@empresa.com", "name": "Ana García", "role": "IT_MANAGER" }
 *
 * // Response 201
 * {
 *   "status": "success",
 *   "data": {
 *     "member": { "id": "...", "email": "nuevo@empresa.com", "role": "IT_MANAGER", ... },
 *     "inviteToken": "eyJ...",
 *     "temporaryPassword": "a1b2c3d4e5f6g7h8"
 *   },
 *   "meta": {
 *     "note": "Comparte la contraseña temporal con el invitado de forma segura.",
 *     "inviteTokenExpiresIn": "72h"
 *   }
 * }
 */
export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const inviterId = req.user!.id;
    const { email, name, role } = req.body as InviteMemberDto;

    // ── 1. Validar campo requerido ──────────────────────────────────────────────
    if (!email) {
      throw new BadRequestError('El campo email es requerido para invitar a un nuevo miembro.');
    }

    // ── 2. Validar formato básico de email ──────────────────────────────
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestError('El formato del email proporcionado no es válido.');
    }

    // ── 3. Validar rol si se proporciona ────────────────────────────────
    if (role && !Object.values(Role).includes(role as Role)) {
      throw new BadRequestError(
        `Rol inválido. Valores permitidos: ${Object.values(Role).join(', ')}`
      );
    }

    // ── 4. Invitar al miembro ──────────────────────────────────────────────
    const result = await OrgService.inviteMember(orgId, inviterId, { email, name, role });

    // ── 5. Auditar la invitación (fire-and-forget) ───────────────────────
    void ActivityLogService.log({
      organizationId: orgId,
      userId: inviterId,
      action: 'MEMBER_INVITED',
      entityType: 'user',
      entityId: result.member.id,
      metadata: {
        invitedEmail: result.member.email,
        assignedRole: result.member.role,
        invitedName: result.member.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      status: 'success',
      message: `Invitación enviada correctamente a ${result.member.email}.`,
      data: {
        member: result.member,
        inviteToken: result.inviteToken,
        temporaryPassword: result.temporaryPassword,
      },
      meta: {
        note: 'Comparte la contraseña temporal y el token de invitación con el nuevo miembro de forma segura. El token expira en 72 horas.',
        inviteTokenExpiresIn: '72h',
        nextStep:
          'El invitado debe usar POST /api/v1/orgs/invite/accept con el inviteToken para establecer su contraseña definitiva (Tarea 86).',
      },
    });
  } catch (error) {
    next(error);
  }
};
