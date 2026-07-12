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
import { NotFoundError } from '../errors/AppError';

// ─────────────────────────────────────────────
// DTOs de entrada
// ─────────────────────────────────────────────

/** Campos actualizables de la organización mediante PATCH /api/v1/orgs/me */
export interface UpdateOrgDto {
  /** Nuevo nombre de la organización */
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
};
