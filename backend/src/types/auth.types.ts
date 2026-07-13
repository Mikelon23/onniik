/**
 * auth.types.ts
 * Tipos e interfaces centrales del módulo de autenticación de Onniik.
 *
 * Estos tipos son compartidos por:
 *   - AuthService        (servicios JWT, hashing)
 *   - AuthController     (controladores de rutas)
 *   - auth.middleware    (verificación de sesión)
 *   - RBAC middleware    (control de roles — Task 79)
 */

import { Role } from '@prisma/client';

// ─────────────────────────────────────────────
// JWT Payload
// ─────────────────────────────────────────────

/**
 * Payload firmado dentro del token JWT de Onniik.
 * Solo contiene datos no sensibles necesarios para
 * autorizar peticiones sin consultar la base de datos.
 */
export interface JwtPayload {
  /** UUID del usuario autenticado */
  id: string;
  /** Email del usuario (identificador único) */
  email: string;
  /** Rol del usuario (ADMIN | READER | IT_MANAGER) */
  role: Role;
  /** UUID de la organización a la que pertenece el usuario */
  organizationId: string;
  /** Restricción opcional del ámbito del token (ej. 'invite') */
  scope?: string;
}

// ─────────────────────────────────────────────
// Request / Response DTOs
// ─────────────────────────────────────────────

/** Credenciales enviadas en POST /api/v1/auth/login */
export interface LoginDto {
  email: string;
  password: string;
}

/** Credenciales enviadas en POST /api/v1/auth/register */
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  /** UUID de la organización a la que pertenece el nuevo usuario */
  organizationId: string;
}

/** Perfil de usuario devuelto en respuestas públicas de auth */
export interface UserPublicProfile {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  organizationId: string;
  organizationName?: string;
}

// ─────────────────────────────────────────────
// Opciones de generación de token
// ─────────────────────────────────────────────

export interface TokenOptions {
  /** Duración del token. Por defecto '1d'. Ej: '15m', '7d' */
  expiresIn?: string | number;
}
