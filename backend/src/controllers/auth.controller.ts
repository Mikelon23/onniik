import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthService } from '../services/auth.service';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';
import { LoginDto, UserPublicProfile } from '../types/auth.types';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * POST /api/v1/auth/login
 * Autentica un usuario con email y contraseña.
 * Establece una cookie JWT HttpOnly en caso de éxito.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginDto;

    if (!email || !password) {
      throw new BadRequestError('El email y la contraseña son requeridos.');
    }

    // 1. Buscar al usuario por correo electrónico
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Respuesta genérica para no revelar si el email existe o no (prevención de enumeración)
    if (!user) {
      throw new UnauthorizedError('Credenciales de acceso inválidas.');
    }

    // 2. Verificar contraseña con bcrypt (comparación de tiempo constante)
    const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales de acceso inválidas.');
    }

    // 3. Generar token JWT firmado
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    // 4. Establecer cookie de sesión HttpOnly
    res.cookie('token', token, AuthService.getCookieOptions());

    // 5. Responder con el perfil público del usuario
    const profile: UserPublicProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    };

    res.status(200).json({
      status: 'success',
      data: { user: profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Cierra la sesión del usuario limpiando la cookie JWT.
 * Requiere autenticación previa (requireAuth middleware).
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Limpiar la cookie con las mismas opciones con las que fue creada
    const cookieOptions = AuthService.getCookieOptions();
    res.clearCookie('token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
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
 * GET /api/v1/auth/me
 * Retorna el perfil actualizado del usuario autenticado actualmente.
 * Requiere autenticación previa (requireAuth middleware).
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
          select: { name: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('El usuario no existe en el sistema.');
    }

    const profile: UserPublicProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
    };

    res.status(200).json({
      status: 'success',
      data: { user: profile },
    });
  } catch (error) {
    next(error);
  }
};
