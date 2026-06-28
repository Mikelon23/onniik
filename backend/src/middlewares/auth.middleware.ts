import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/AppError';

// Interfaz extendida para Express Request con el usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

/**
 * Middleware para exigir que el usuario esté autenticado mediante cookie HttpOnly
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    next(new UnauthorizedError('Acceso no autorizado: No se encontró sesión activa.'));
    return;
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || 'ejemplo_hash_secreto_muy_largo_de_32_caracteres';
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
      organizationId: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch {
    next(new UnauthorizedError('Acceso no autorizado: Sesión inválida o expirada.'));
  }
};
