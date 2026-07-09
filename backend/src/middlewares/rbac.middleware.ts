/**
 * rbac.middleware.ts
 * Middlewares de Control de Acceso Basado en Roles (RBAC) de Onniik.
 *
 * Jerarquía de uso recomendada en rutas:
 *   1. requireAuth          — verifica JWT y adjunta req.user
 *   2. requireRole(...)     — verifica que el rol esté en la lista permitida
 *   3. requirePermission(P) — verifica un permiso granular específico
 *
 * Ejemplos de uso en routers:
 *   router.delete('/users/:id', requireAuth, requireAdmin, controller);
 *   router.post('/alerts/:id/accept', requireAuth, requireCanManageAlerts, controller);
 *   router.get('/logs', requireAuth, requirePermission(Permission.VIEW_ACTIVITY_LOGS), controller);
 */

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth.middleware';
import { Permission, ROLE_PERMISSIONS, hasRolePermission } from '../types/rbac.types';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

// Re-exportar para que los routers no necesiten importar desde auth.middleware
export { Permission, hasRolePermission };

// ─────────────────────────────────────────────
// Helper interno
// ─────────────────────────────────────────────

/**
 * Garantiza que req.user esté definido (requireAuth fue aplicado antes).
 * Lanza UnauthorizedError si no es así — protección ante mal uso.
 */
function assertAuthenticated(req: AuthenticatedRequest, next: NextFunction): boolean {
  if (!req.user) {
    next(
      new UnauthorizedError(
        'Error de configuración: los middlewares RBAC deben usarse después de requireAuth.'
      )
    );
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// requirePermission — control granular
// ─────────────────────────────────────────────

/**
 * Verifica que el usuario autenticado tenga un permiso específico.
 *
 * Este es el middleware más granular del sistema RBAC.
 * Ideal para rutas donde los límites de acceso no coinciden
 * exactamente con un rol sino con una acción específica.
 *
 * @param permission - Permiso del enum Permission requerido para acceder
 *
 * @example
 * router.post('/saas/:id/cancel',
 *   requireAuth,
 *   requirePermission(Permission.CANCEL_SUBSCRIPTION),
 *   controller
 * );
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!assertAuthenticated(req, next)) return;

    const userRole = req.user!.role as Role;
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!rolePermissions || !rolePermissions.has(permission)) {
      next(
        new ForbiddenError(
          `Acceso denegado. El rol '${userRole}' no tiene el permiso requerido: '${permission}'.`
        )
      );
      return;
    }

    next();
  };
};

// ─────────────────────────────────────────────
// Middlewares de conveniencia por rol
// ─────────────────────────────────────────────

/**
 * Permite el acceso SOLO al rol ADMIN.
 * Para operaciones críticas: gestión de organización, eliminación de usuarios,
 * cambio de roles, configuración avanzada.
 *
 * @example
 * router.delete('/orgs/:id', requireAuth, requireAdmin, orgController.delete);
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!assertAuthenticated(req, next)) return;

  if (req.user!.role !== Role.ADMIN) {
    next(new ForbiddenError('Acceso restringido: se requiere el rol ADMIN para esta operación.'));
    return;
  }
  next();
};

/**
 * Permite el acceso SOLO al rol IT_MANAGER.
 * Para operaciones técnicas que no requieren privilegio de administrador
 * pero tampoco deben ser accesibles para READER.
 *
 * @example
 * router.post('/integrations/connect', requireAuth, requireItManager, controller);
 */
export const requireItManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!assertAuthenticated(req, next)) return;

  if (req.user!.role !== Role.IT_MANAGER) {
    next(
      new ForbiddenError('Acceso restringido: se requiere el rol IT_MANAGER para esta operación.')
    );
    return;
  }
  next();
};

/**
 * Permite el acceso a ADMIN o IT_MANAGER.
 * El caso más común en Onniik: operaciones de gestión que no requieren
 * ser el administrador principal de la cuenta.
 *
 * Cubre: gestión de suscripciones, aceptar/descartar alertas,
 * conectar integraciones, importar CSV, analizar con IA.
 *
 * @example
 * router.post('/alerts/:id/accept', requireAuth, requireAdminOrItManager, controller);
 * router.post('/saas', requireAuth, requireAdminOrItManager, controller);
 */
export const requireAdminOrItManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!assertAuthenticated(req, next)) return;

  const allowedRoles: Role[] = [Role.ADMIN, Role.IT_MANAGER];
  if (!allowedRoles.includes(req.user!.role as Role)) {
    next(
      new ForbiddenError(
        'Acceso restringido: se requiere rol ADMIN o IT_MANAGER para esta operación.'
      )
    );
    return;
  }
  next();
};

// ─────────────────────────────────────────────
// Middlewares de conveniencia por dominio
// ─────────────────────────────────────────────

/**
 * Permite acceso a usuarios que pueden gestionar alertas (ADMIN + IT_MANAGER).
 * Alias semántico de requireAdminOrItManager para mayor legibilidad en rutas.
 */
export const requireCanManageAlerts = requireAdminOrItManager;

/**
 * Permite acceso a usuarios que pueden gestionar suscripciones (ADMIN + IT_MANAGER).
 */
export const requireCanManageSubscriptions = requireAdminOrItManager;

/**
 * Permite acceso a usuarios que pueden gestionar integraciones (ADMIN + IT_MANAGER).
 */
export const requireCanManageIntegrations = requireAdminOrItManager;

/**
 * Permite acceso a usuarios que pueden ver logs de actividad (ADMIN + IT_MANAGER).
 * Los READER no tienen acceso al historial de auditoría.
 */
export const requireCanViewLogs = requireAdminOrItManager;

/**
 * Permite acceso a usuarios que pueden interactuar con el motor de IA (ADMIN + IT_MANAGER).
 */
export const requireCanUseAI = requireAdminOrItManager;
