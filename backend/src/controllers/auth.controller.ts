import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Inicia sesión de un usuario y establece la cookie JWT HttpOnly
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('El email y la contraseña son requeridos.');
    }

    // Buscar al usuario por correo electrónico
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales de acceso inválidas.');
    }

    // Verificar la contraseña cifrada
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales de acceso inválidas.');
    }

    // Firmar el token JWT
    const secret = process.env.NEXTAUTH_SECRET || 'ejemplo_hash_secreto_muy_largo_de_32_caracteres';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      secret,
      { expiresIn: '1d' }
    );

    // Establecer la cookie de sesión HttpOnly segura
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cierra la sesión del usuario limpiando la cookie JWT
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada exitosamente.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna el perfil del usuario autenticado actualmente
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('No se encontró sesión activa.');
    }

    // Consultar información actualizada del usuario e incluir su organización
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('El usuario no existe en el sistema.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
