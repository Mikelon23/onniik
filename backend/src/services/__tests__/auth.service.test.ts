/**
 * auth.service.test.ts
 * Pruebas unitarias para AuthService (Módulo de Autenticación JWT de Onniik).
 *
 * Cobertura:
 *   - Generación de token JWT (generateToken)
 *   - Verificación y decodificación de token JWT (verifyToken)
 *   - Manejo de tokens expirados o adulterados (UnauthorizedError)
 *   - Hashing y comparación de contraseñas con bcrypt (hashPassword, comparePassword)
 *   - Comportamiento de secreto JWT (NEXTAUTH_SECRET) en desarrollo y producción
 *   - Generación de opciones de cookies HttpOnly seguras (getCookieOptions)
 */

import jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';
import { UnauthorizedError, InternalServerError } from '../../errors/AppError';
import { JwtPayload } from '../../types/auth.types';

describe('AuthService', () => {
  jest.setTimeout(15000);
  const originalEnv = process.env;

  const mockUserPayload: JwtPayload = {
    id: 'usr_123456',
    email: 'test@onniik.com',
    role: 'ADMIN',
    organizationId: 'org_789012',
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXTAUTH_SECRET = 'secreto_super_seguro_de_prueba_123456';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ─────────────────────────────────────────────
  // Pruebas: Generación y Verificación de JWT
  // ─────────────────────────────────────────────

  describe('generateToken & verifyToken', () => {
    it('debe generar un token JWT válido y decodificar el payload correctamente', () => {
      const token = AuthService.generateToken(mockUserPayload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = AuthService.verifyToken(token);
      expect(decoded.id).toBe(mockUserPayload.id);
      expect(decoded.email).toBe(mockUserPayload.email);
      expect(decoded.role).toBe(mockUserPayload.role);
      expect(decoded.organizationId).toBe(mockUserPayload.organizationId);
    });

    it('debe permitir especificar un tiempo de expiración personalizado (options.expiresIn)', () => {
      const token = AuthService.generateToken(mockUserPayload, { expiresIn: '2h' });
      const decoded = AuthService.verifyToken(token);
      expect(decoded.id).toBe(mockUserPayload.id);
    });

    it('debe lanzar UnauthorizedError cuando el token ha expirado', () => {
      const expiredToken = jwt.sign(mockUserPayload, process.env.NEXTAUTH_SECRET!, {
        expiresIn: '-1s',
      });

      expect(() => AuthService.verifyToken(expiredToken)).toThrow(UnauthorizedError);
      expect(() => AuthService.verifyToken(expiredToken)).toThrow(
        'La sesión ha expirado. Por favor, inicia sesión nuevamente.'
      );
    });

    it('debe lanzar UnauthorizedError cuando el token ha sido alterado o manipulado', () => {
      const token = AuthService.generateToken(mockUserPayload);
      const tamperedToken = token.substring(0, token.length - 5) + 'xxxxx';

      expect(() => AuthService.verifyToken(tamperedToken)).toThrow(UnauthorizedError);
      expect(() => AuthService.verifyToken(tamperedToken)).toThrow(
        'Token de sesión inválido o manipulado.'
      );
    });

    it('debe lanzar UnauthorizedError si el token fue firmado con otro secreto', () => {
      const foreignToken = jwt.sign(mockUserPayload, 'secreto_totalmente_diferente');

      expect(() => AuthService.verifyToken(foreignToken)).toThrow(UnauthorizedError);
    });

    it('debe lanzar UnauthorizedError si se pasa una cadena no válida como token', () => {
      expect(() => AuthService.verifyToken('cadena_invalida')).toThrow(UnauthorizedError);
    });
  });

  // ─────────────────────────────────────────────
  // Pruebas: Hashing y Comparación de Contraseñas
  // ─────────────────────────────────────────────

  describe('hashPassword & comparePassword', () => {
    const plainPassword = 'PasswordSegura123!';

    it('debe generar un hash bcrypt válido que no sea igual al texto plano', async () => {
      const hash = await AuthService.hashPassword(plainPassword);
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('debe retornar true cuando la contraseña en texto plano coincide con el hash', async () => {
      const hash = await AuthService.hashPassword(plainPassword);
      const isMatch = await AuthService.comparePassword(plainPassword, hash);
      expect(isMatch).toBe(true);
    });

    it('debe retornar false cuando la contraseña no coincide con el hash', async () => {
      const hash = await AuthService.hashPassword(plainPassword);
      const isMatch = await AuthService.comparePassword('PasswordIncorrecta999!', hash);
      expect(isMatch).toBe(false);
    });

    it('debe generar hashes distintos para la misma contraseña debido al salting aleatorio', async () => {
      const hash1 = await AuthService.hashPassword(plainPassword);
      const hash2 = await AuthService.hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
      expect(await AuthService.comparePassword(plainPassword, hash1)).toBe(true);
      expect(await AuthService.comparePassword(plainPassword, hash2)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Pruebas: getCookieOptions
  // ─────────────────────────────────────────────

  describe('getCookieOptions', () => {
    it('debe retornar opciones de cookie en modo desarrollo/test (secure: false, sameSite: lax)', () => {
      process.env.NODE_ENV = 'development';
      const options = AuthService.getCookieOptions();

      expect(options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 86400000,
      });
    });

    it('debe retornar opciones de cookie estrictas en producción (secure: true, sameSite: strict)', () => {
      process.env.NODE_ENV = 'production';
      const options = AuthService.getCookieOptions();

      expect(options).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400000,
      });
    });
  });

  // ─────────────────────────────────────────────
  // Pruebas: getJwtSecret & Entorno de Producción
  // ─────────────────────────────────────────────

  describe('getJwtSecret Behavior', () => {
    it('debe lanzar InternalServerError en producción si NEXTAUTH_SECRET no está configurado', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXTAUTH_SECRET;

      expect(() => AuthService.generateToken(mockUserPayload)).toThrow(InternalServerError);
      expect(() => AuthService.generateToken(mockUserPayload)).toThrow(
        'NEXTAUTH_SECRET no está configurado. El servidor no puede operar en producción sin un secreto JWT válido.'
      );
    });

    it('debe lanzar InternalServerError en producción si NEXTAUTH_SECRET usa el valor de fallback', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXTAUTH_SECRET = 'ejemplo_hash_secreto_muy_largo_de_32_caracteres';

      expect(() => AuthService.generateToken(mockUserPayload)).toThrow(InternalServerError);
    });

    it('debe usar el valor por defecto de fallback en desarrollo cuando no hay NEXTAUTH_SECRET', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXTAUTH_SECRET;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const token = AuthService.generateToken(mockUserPayload);
      expect(typeof token).toBe('string');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH] ⚠️  ADVERTENCIA: NEXTAUTH_SECRET no está definido')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────
  // Pruebas: Blacklisting de tokens en Redis
  // ─────────────────────────────────────────────

  describe('blacklistToken & isTokenBlacklisted', () => {
    it('debe registrar el token en Redis con setex y TTL adecuado', async () => {
      const token = AuthService.generateToken(mockUserPayload, { expiresIn: '1h' });
      await expect(AuthService.blacklistToken(token)).resolves.not.toThrow();
    });

    it('debe ignorar llamadas con token vacío o undefined', async () => {
      await expect(AuthService.blacklistToken('')).resolves.not.toThrow();
      await expect(AuthService.isTokenBlacklisted('')).resolves.toBe(false);
    });

    it('debe consultar la existencia del token en Redis', async () => {
      const token = AuthService.generateToken(mockUserPayload);
      const isBlacklisted = await AuthService.isTokenBlacklisted(token);
      expect(typeof isBlacklisted).toBe('boolean');
    });
  });
});
