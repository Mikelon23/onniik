/**
 * auth.service.ts
 * Módulo de autenticación JWT de Onniik.
 *
 * Centraliza toda la lógica de:
 *   - Generación y verificación de tokens JWT
 *   - Hashing y comparación de contraseñas (bcrypt)
 *   - Obtención del secreto JWT de forma segura
 *
 * NINGÚN otro archivo debe importar `jsonwebtoken` o `bcryptjs` directamente.
 * Todas las operaciones de auth pasan por este servicio.
 */

import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { JwtPayload, TokenOptions } from '../types/auth.types';
import { UnauthorizedError, InternalServerError } from '../errors/AppError';

// ─────────────────────────────────────────────
// Constantes del módulo
// ─────────────────────────────────────────────

/** Número de rondas de sal para bcrypt. 12 es el balance seguridad/performance recomendado. */
const BCRYPT_SALT_ROUNDS = 12;

/** Duración por defecto del token JWT de sesión (1 día). */
const DEFAULT_TOKEN_EXPIRY = '1d';

// ─────────────────────────────────────────────
// Helper interno: obtener secreto JWT
// ─────────────────────────────────────────────

/**
 * Obtiene el secreto JWT desde las variables de entorno.
 * Lanza un error crítico en producción si no está configurado.
 *
 * @throws {InternalServerError} Si el secreto no está definido en producción.
 */
function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  const fallback = 'ejemplo_hash_secreto_muy_largo_de_32_caracteres';

  if (!secret || secret === fallback) {
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerError(
        'NEXTAUTH_SECRET no está configurado. El servidor no puede operar en producción sin un secreto JWT válido.'
      );
    }
    // En desarrollo, usar el fallback con advertencia en consola
    if (!secret) {
      console.warn(
        '[AUTH] ⚠️  ADVERTENCIA: NEXTAUTH_SECRET no está definido. Usando valor por defecto para desarrollo. NO usar en producción.'
      );
    }
    return fallback;
  }

  return secret;
}

// ─────────────────────────────────────────────
// AuthService
// ─────────────────────────────────────────────

export const AuthService = {
  /**
   * Genera un token JWT firmado con el payload del usuario.
   *
   * @param payload - Datos del usuario a incluir en el token (id, email, role, orgId)
   * @param options - Opciones opcionales como `expiresIn`
   * @returns Token JWT firmado como string
   *
   * @example
   * const token = AuthService.generateToken({ id, email, role, organizationId });
   */
  generateToken(payload: JwtPayload, options: TokenOptions = {}): string {
    const secret = getJwtSecret();
    const expiresIn = options.expiresIn ?? DEFAULT_TOKEN_EXPIRY;

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  },

  /**
   * Verifica y decodifica un token JWT.
   * Lanza UnauthorizedError si el token es inválido, expirado o manipulado.
   *
   * @param token - Token JWT a verificar (extraído de cookie o header)
   * @returns El payload decodificado y verificado
   * @throws {UnauthorizedError} Si el token es inválido o expirado
   *
   * @example
   * const payload = AuthService.verifyToken(req.cookies.token);
   */
  verifyToken(token: string): JwtPayload {
    const secret = getJwtSecret();

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token de sesión inválido o manipulado.');
      }
      throw new UnauthorizedError('Acceso no autorizado: Sesión inválida o expirada.');
    }
  },

  /**
   * Genera un hash seguro de una contraseña usando bcrypt (12 rondas de sal).
   *
   * @param plainPassword - Contraseña en texto plano
   * @returns Hash bcrypt listo para almacenar en la base de datos
   *
   * @example
   * const hash = await AuthService.hashPassword('MiContraseña123!');
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return bcryptjs.hash(plainPassword, BCRYPT_SALT_ROUNDS);
  },

  /**
   * Compara una contraseña en texto plano contra su hash bcrypt almacenado.
   * Usa comparación de tiempo constante para prevenir timing attacks.
   *
   * @param plainPassword - Contraseña ingresada por el usuario
   * @param hash - Hash almacenado en la base de datos
   * @returns `true` si coinciden, `false` si no
   *
   * @example
   * const isValid = await AuthService.comparePassword(password, user.passwordHash);
   */
  async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(plainPassword, hash);
  },

  /**
   * Construye las opciones de cookie HttpOnly para la sesión JWT.
   * Aplica `secure: true` y `sameSite: 'strict'` solo en producción.
   *
   * @returns Objeto de opciones compatible con `res.cookie()` de Express
   */
  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  } {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 día en milisegundos
    };
  },
};
