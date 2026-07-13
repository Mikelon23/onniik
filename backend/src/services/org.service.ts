/**
 * org.service.ts
 * Capa de lógica de negocio para la gestión de organizaciones en Onniik.
 *
 * Responsabilidades:
 *   - Obtener los datos completos de una organización por su ID
 *   - Actualizar el nombre u otros metadatos de la organización
 *   - Listar los miembros de una organización con sus roles
 *
 * IMPORTANTE: Este servicio NUNCA expone datos sensibles de otros usuarios
 * (passwordHash, tokens OAuth) — retorna solo proyecciones seguras.
 *
 * Tarea 80 — /api/v1/orgs
 */

import prisma from '../config/db';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import crypto from 'crypto';
import { UserPublicProfile } from '../types/auth.types';

// ─────────────────────────────────────────────
// DTOs de entrada
// ─────────────────────────────────────────────

/** Campos actualizables de la organización mediante PATCH /api/v1/orgs/me */
export interface UpdateOrgDto {
  /** Nuevo nombre de la organización */
  name?: string;
}

/** Datos necesarios para invitar a un nuevo miembro */
export interface InviteMemberDto {
  /** Email del nuevo miembro (debe ser único en el sistema) */
  email: string;
  /** Nombre completo del nuevo miembro (opcional) */
  name?: string;
  /** Rol que se asignará al nuevo miembro (default: READER) */
  role?: Role;
}

/** Resultado de la invitación — incluye el token de activación para T86 */
export interface InviteResult {
  /** Perfil público del usuario recién creado */
  member: OrgMemberProfile;
  /**
   * Token de invitación firmado con JWT (scope: 'invite').
   * El invitado debe usarlo en POST /api/v1/orgs/invite/accept (T86)
   * para establecer su contraseña definitiva.
   * Expira en 72 horas.
   */
  inviteToken: string;
  /**
   * Contraseña temporal generada (solo presente en la respuesta de invitación).
   * Debe compartirse con el invitado de forma segura.
   * El invitado deberá cambiarla al aceptar la invitación (T86).
   */
  temporaryPassword: string;
}

/** DTO para que el invitado acepte la invitación y establezca su contraseña definitiva */
export interface AcceptInviteDto {
  /**
   * Token JWT de invitación (recibido por el admin al ejecutar POST /api/v1/orgs/invite).
   * Firmado con el mismo secreto que los tokens de sesión. Expira en 72h.
   */
  inviteToken: string;
  /** Nueva contraseña definitiva del usuario (mín. 8 chars, al menos 1 letra y 1 dígito) */
  newPassword: string;
  /** Nombre completo del usuario (opcional — puede actualizarlo al aceptar) */
  name?: string;
}

// ─────────────────────────────────────────────
// Tipos de respuesta (proyecciones seguras)
// ─────────────────────────────────────────────

/** Perfil público de la organización */
export interface OrgPublicProfile {
  id: string;
  name: string;
  googleCustomerId: string | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Perfil de un miembro de la organización (sin datos sensibles) */
export interface OrgMemberProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  joinedAt: Date;
}

// ─────────────────────────────────────────────
// OrgService
// ─────────────────────────────────────────────

export const OrgService = {
  /**
   * Obtiene el perfil público de una organización por su ID.
   * Incluye el conteo de miembros activos.
   *
   * @param orgId - UUID de la organización
   * @returns Perfil público de la organización
   * @throws {NotFoundError} Si la organización no existe
   *
   * @example
   * const org = await OrgService.getOrgById(req.user.organizationId);
   */
  async getOrgById(orgId: string): Promise<OrgPublicProfile> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        googleCustomerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundError('La organización solicitada no existe.');
    }

    return {
      id: org.id,
      name: org.name,
      googleCustomerId: org.googleCustomerId,
      memberCount: org._count.users,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  },

  /**
   * Actualiza los metadatos de una organización.
   * Solo el ADMIN de la organización puede ejecutar esta operación.
   *
   * Campos actualizables:
   *   - name: nombre comercial de la organización
   *
   * @param orgId   - UUID de la organización a actualizar
   * @param updates - Campos a modificar (solo los enviados se actualizan)
   * @returns Perfil actualizado de la organización
   * @throws {NotFoundError}  Si la organización no existe
   * @throws {BadRequestError} Si no se envía ningún campo actualizable
   *
   * @example
   * const updated = await OrgService.updateOrg(orgId, { name: 'Nuevo Nombre S.A.' });
   */
  async updateOrg(orgId: string, updates: UpdateOrgDto): Promise<OrgPublicProfile> {
    // Verificar existencia de la organización antes de intentar actualizar
    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!existingOrg) {
      throw new NotFoundError('La organización solicitada no existe.');
    }

    // Construir objeto de actualización solo con campos provistos
    // (evitar sobreescribir campos con undefined)
    const updateData: { name?: string } = {};
    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
      select: {
        id: true,
        name: true,
        googleCustomerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return {
      id: updatedOrg.id,
      name: updatedOrg.name,
      googleCustomerId: updatedOrg.googleCustomerId,
      memberCount: updatedOrg._count.users,
      createdAt: updatedOrg.createdAt,
      updatedAt: updatedOrg.updatedAt,
    };
  },

  /**
   * Lista todos los miembros de una organización con sus roles.
   * Los resultados están ordenados por nombre de forma ascendente.
   *
   * Proyección segura: no incluye passwordHash ni datos sensibles.
   *
   * @param orgId - UUID de la organización
   * @returns Array de perfiles de miembros
   * @throws {NotFoundError} Si la organización no existe
   *
   * @example
   * const members = await OrgService.getOrgMembers(req.user.organizationId);
   */
  async getOrgMembers(orgId: string): Promise<OrgMemberProfile[]> {
    // Verificar que la organización existe antes de listar
    const orgExists = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!orgExists) {
      throw new NotFoundError('La organización solicitada no existe.');
    }

    const members = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      joinedAt: m.createdAt,
    }));
  },

  /**
   * Invita a un nuevo miembro a la organización.
   *
   * Flujo:
   *   1. Valida que el email no esté ya registrado en el sistema.
   *   2. Genera una contraseña temporal segura (12 chars, aleatoria).
   *   3. Crea el usuario con la contraseña temporal hasheada.
   *   4. Genera un token JWT de invitación (scope: 'invite', expira en 72h).
   *   5. Devuelve el perfil del nuevo miembro + token + contraseña temporal.
   *
   * El token de invitación se usará en T86 (POST /api/v1/orgs/invite/accept)
   * para que el invitado establezca su contraseña definitiva.
   *
   * NOTA: La contraseña temporal se devuelve en texto plano UNA SOLA VEZ.
   * El administrador debe compartirla de forma segura con el invitado.
   * Cuando esté disponible el servicio de email (T91-92), este campo
   * será reemplazado por un envío automático al correo del invitado.
   *
   * @param orgId      - UUID de la organización (del JWT del administrador)
   * @param inviterId  - UUID del administrador que realiza la invitación
   * @param dto        - Datos del nuevo miembro (email, nombre, rol)
   *
   * @throws {NotFoundError}  Si la organización no existe
   * @throws {ConflictError}  Si el email ya está registrado en el sistema
   * @throws {BadRequestError} Si el rol es inválido
   */
  async inviteMember(
    orgId: string,
    inviterId: string,
    dto: InviteMemberDto
  ): Promise<InviteResult> {
    // 1. Verificar que la organización existe
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      throw new NotFoundError('La organización especificada no existe.');
    }

    // 2. Validar que el email no esté ya registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      select: { id: true, organizationId: true },
    });

    if (existingUser) {
      if (existingUser.organizationId === orgId) {
        throw new ConflictError('Este email ya pertenece a un miembro de tu organización.');
      }
      throw new ConflictError('Este email ya está registrado en el sistema de Onniik.');
    }

    // 3. Validar que el rol es válido (si se especificó)
    const allowedRoles: Role[] = [Role.ADMIN, Role.IT_MANAGER, Role.READER];
    const assignedRole = dto.role ?? Role.READER;
    if (!allowedRoles.includes(assignedRole)) {
      throw new BadRequestError(`Rol inválido. Valores permitidos: ${allowedRoles.join(', ')}`);
    }

    // 4. Generar contraseña temporal segura (16 chars hexadecimal)
    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // 16 chars hex

    // 5. Hashear la contraseña temporal
    const passwordHash = await AuthService.hashPassword(temporaryPassword);

    // 6. Crear el usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        name: dto.name?.trim() ?? null,
        role: assignedRole,
        organizationId: orgId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 7. Generar token de invitación (JWT con scope restrictivo, 72h)
    // El payload incluye scope: 'invite' para que T86 pueda validar
    // que este token solo sirve para aceptar invitaciones
    const inviteToken = AuthService.generateToken(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        organizationId: orgId,
        scope: 'invite',
      },
      { expiresIn: '72h' }
    );

    const member: OrgMemberProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      joinedAt: newUser.createdAt,
    };

    return {
      member,
      inviteToken,
      temporaryPassword,
    };
  },

  /**
   * Acepta una invitación de miembro y establece su contraseña definitiva.
   *
   * Flujo (Tarea 86):
   *   1. Verifica el inviteToken (debe ser un JWT firmado y no expirado).
   *   2. Valida que el token tenga el scope 'invite'.
   *   3. Obtiene el usuario asociado y valida que coincida su email y organización.
   *   4. Valida los criterios de seguridad de la nueva contraseña.
   *   5. Hashea la nueva contraseña y actualiza el usuario en la BD (y su nombre si se provee).
   *   6. Retorna el perfil público del usuario actualizado.
   *
   * @param dto - Datos para aceptar la invitación (inviteToken, newPassword, name)
   * @returns Perfil público del usuario actualizado
   * @throws {BadRequestError} Si los datos son inválidos o la contraseña no es segura
   * @throws {NotFoundError} Si el usuario o la organización no existen
   */
  async acceptInvite(dto: AcceptInviteDto): Promise<UserPublicProfile> {
    const { inviteToken, newPassword, name } = dto;

    // 1. Validar campos requeridos
    if (!inviteToken) {
      throw new BadRequestError('El token de invitación es requerido.');
    }
    if (!newPassword) {
      throw new BadRequestError('La nueva contraseña es requerida.');
    }

    // 2. Validar fortaleza de la contraseña
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new BadRequestError(
        'La contraseña debe tener al menos 8 caracteres, incluir una letra y un número.'
      );
    }

    // 3. Verificar el token JWT de invitación
    // verifyToken lanzará UnauthorizedError si el token es inválido o expiró
    const payload = AuthService.verifyToken(inviteToken);

    // 4. Validar que el scope sea restrictivo de invitación
    if (payload.scope !== 'invite') {
      throw new BadRequestError('El token provisto no es válido para aceptar invitaciones.');
    }

    // 5. Buscar al usuario e incluir su organización
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('El usuario asociado a la invitación no existe.');
    }

    // Validaciones de coincidencia para mitigar manipulación externa
    if (user.email.toLowerCase().trim() !== payload.email.toLowerCase().trim()) {
      throw new BadRequestError('El token de invitación no corresponde a este usuario.');
    }
    if (user.organizationId !== payload.organizationId) {
      throw new BadRequestError(
        'El token de invitación no corresponde a la organización indicada.'
      );
    }

    // 6. Hashear la nueva contraseña definitiva
    const passwordHash = await AuthService.hashPassword(newPassword);

    // 7. Preparar datos de actualización
    const updateData: { passwordHash: string; name?: string | null } = { passwordHash };
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    // 8. Actualizar el usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      organizationId: updatedUser.organizationId,
      organizationName: user.organization.name,
    };
  },
};
