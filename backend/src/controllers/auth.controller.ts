import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthService } from '../services/auth.service';
import { BadRequestError, UnauthorizedError, ConflictError } from '../errors/AppError';
import { LoginDto, RegisterDto, UserPublicProfile } from '../types/auth.types';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// Regex de validación de email básico (RFC 5322 simplificado)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/v1/auth/register
 * Registra un nuevo usuario en una organización existente.
 *
 * Validaciones aplicadas:
 *   - Campos requeridos: email, password, organizationId
 *   - Formato de email válido
 *   - Contraseña: mínimo 8 caracteres, al menos 1 letra y 1 dígito
 *   - La organización debe existir
 *   - El email no debe estar ya registrado
 *
 * En caso de éxito, auto-inicia sesión estableciendo la cookie JWT HttpOnly.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, organizationId } = req.body as RegisterDto;

    // ── 1. Validación de campos requeridos ────────────────────────────
    if (!email || !password || !organizationId) {
      throw new BadRequestError('Email, contraseña y organizationId son campos requeridos.');
    }

    // ── 2. Validación de formato de email ─────────────────────────────
    if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestError('El formato del email proporcionado no es válido.');
    }

    // ── 3. Validación de fortaleza de contraseña ──────────────────────
    // Mínimo 8 chars, al menos 1 letra y 1 dígito
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      throw new BadRequestError(
        'La contraseña debe tener al menos 8 caracteres, incluir una letra y un número.'
      );
    }

    // ── 4. Verificar que la organización existe ───────────────────────
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    if (!organization) {
      throw new BadRequestError('La organización especificada no existe.');
    }

    // ── 5. Verificar que el email no está ya registrado ───────────────
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictError('Ya existe una cuenta registrada con este correo electrónico.');
    }

    // ── 6. Hashear contraseña con bcrypt (12 rondas) ──────────────────
    const passwordHash = await AuthService.hashPassword(password);

    // ── 7. Crear el usuario en la base de datos ───────────────────────
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name?.trim() ?? null,
        organizationId,
        role: 'READER', // Los nuevos usuarios comienzan con el rol más restrictivo
      },
    });

    // ── 8. Auto-login: generar token JWT y establecer cookie ──────────
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    res.cookie('token', token, AuthService.getCookieOptions());

    // ── 9. Responder con el perfil del usuario creado ─────────────────
    const profile: UserPublicProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: organization.name,
    };

    res.status(201).json({
      status: 'success',
      data: { user: profile },
    });
  } catch (error) {
    next(error);
  }
};

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
