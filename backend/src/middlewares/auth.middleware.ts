import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../types/auth.types';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

// ─────────────────────────────────────────────
// Tipo extendido de Express Request
// ─────────────────────────────────────────────

/**
 * Extiende Express Request con el payload JWT del usuario autenticado.
 * Disponible en todas las rutas protegidas por `requireAuth`.
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─────────────────────────────────────────────
// Middlewares de autenticación y autorización
// ─────────────────────────────────────────────

/**
 * Middleware de autenticación JWT.
 *
 * Extrae el token de la cookie HttpOnly `token`, lo verifica mediante
 * AuthService.verifyToken() y adjunta el payload decodificado en `req.user`.
 *
 * Uso:
 *   router.get('/protected', requireAuth, myController);
 *
 * @throws {UnauthorizedError} Si no hay cookie, el token es inválido o expirado.
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    next(new UnauthorizedError('Acceso no autorizado: No se encontró sesión activa.'));
    return;
  }

  try {
    // AuthService.verifyToken lanza UnauthorizedError con mensajes específicos
    // según el tipo de fallo (expirado vs inválido)
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware de autorización basado en roles (RBAC).
 *
 * Debe usarse DESPUÉS de `requireAuth`. Verifica que el usuario autenticado
 * tenga al menos uno de los roles permitidos.
 *
 * Uso:
 *   router.delete('/admin-only', requireAuth, requireRole('ADMIN'), myController);
 *   router.get('/it-or-admin', requireAuth, requireRole('ADMIN', 'IT_MANAGER'), myController);
 *
 * @param allowedRoles - Uno o más roles permitidos para acceder a la ruta
 * @throws {UnauthorizedError} Si `req.user` no está definido (requireAuth no fue aplicado antes)
 * @throws {ForbiddenError} Si el rol del usuario no está entre los permitidos
 *
 * @note La implementación completa de RBAC se realiza en la Tarea 79.
 *       Este middleware es el punto de extensión para dicha tarea.
 */
export const requireRole = (...allowedRoles: JwtPayload['role'][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Acceso no autorizado: requireRole requiere requireAuth previo.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}.`
        )
      );
      return;
    }

    next();
  };
};
