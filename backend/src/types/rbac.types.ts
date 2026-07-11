/**
 * rbac.types.ts
 * Definición del sistema de Control de Acceso Basado en Roles (RBAC) de Onniik.
 *
 * Arquitectura de permisos:
 *   Role (JWT) → ROLE_PERMISSIONS[role] → Set<Permission>
 *
 * Los middlewares de rbac.middleware.ts usan esta matriz para decidir
 * si una petición tiene acceso a un recurso o acción específica.
 *
 * Para agregar un nuevo permiso:
 *   1. Añadir el valor al enum Permission
 *   2. Asignarlo a los roles que deban tenerlo en ROLE_PERMISSIONS
 *   3. Usar requirePermission(Permission.NEW_PERM) en la ruta correspondiente
 */

import { Role } from '@prisma/client';

// ─────────────────────────────────────────────
// Enum de permisos granulares
// ─────────────────────────────────────────────

export enum Permission {
  // ── Dashboard ─────────────────────────────
  VIEW_DASHBOARD = 'view:dashboard',

  // ── Inventario SaaS ───────────────────────
  VIEW_SUBSCRIPTIONS = 'view:subscriptions',
  CREATE_SUBSCRIPTION = 'create:subscription',
  UPDATE_SUBSCRIPTION = 'update:subscription',
  DELETE_SUBSCRIPTION = 'delete:subscription',
  CANCEL_SUBSCRIPTION = 'cancel:subscription',

  // ── Usuarios y Organización ───────────────
  VIEW_USERS = 'view:users',
  INVITE_MEMBER = 'invite:member',
  REMOVE_MEMBER = 'remove:member',
  CHANGE_MEMBER_ROLE = 'change:member:role',
  MANAGE_ORG = 'manage:org',

  // ── Alertas de Optimización ───────────────
  VIEW_ALERTS = 'view:alerts',
  ACCEPT_ALERT = 'accept:alert',
  DISMISS_ALERT = 'dismiss:alert',

  // ── Integraciones (OAuth) ─────────────────
  VIEW_INTEGRATIONS = 'view:integrations',
  CONNECT_INTEGRATION = 'connect:integration',
  DISCONNECT_INTEGRATION = 'disconnect:integration',

  // ── Datos y Exportaciones ─────────────────
  VIEW_ACTIVITY_LOGS = 'view:activity-logs',
  EXPORT_DATA = 'export:data',
  IMPORT_CSV = 'import:csv',

  // ── Motor de IA ───────────────────────────
  VIEW_AI_RECOMMENDATIONS = 'view:ai-recommendations',
  TRIGGER_AI_ANALYSIS = 'trigger:ai-analysis',
  GENERATE_AI_DRAFT = 'generate:ai-draft',
}

// ─────────────────────────────────────────────
// Matriz de Roles → Permisos
// ─────────────────────────────────────────────

/**
 * Define exactamente qué puede hacer cada rol en la plataforma.
 *
 * ADMIN       — Control total: gestión de org, usuarios, suscripciones, IA e integraciones.
 * IT_MANAGER  — Operaciones técnicas: suscripciones, integraciones, alertas y análisis IA.
 *               NO puede gestionar usuarios ni configurar la organización.
 * READER      — Solo lectura: dashboard, inventario y recomendaciones.
 *               NO puede modificar nada ni ejecutar acciones.
 */
export const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  // ── ADMIN: acceso total ───────────────────────────────────────────
  [Role.ADMIN]: new Set([
    // Dashboard
    Permission.VIEW_DASHBOARD,
    // Suscripciones
    Permission.VIEW_SUBSCRIPTIONS,
    Permission.CREATE_SUBSCRIPTION,
    Permission.UPDATE_SUBSCRIPTION,
    Permission.DELETE_SUBSCRIPTION,
    Permission.CANCEL_SUBSCRIPTION,
    // Usuarios y org
    Permission.VIEW_USERS,
    Permission.INVITE_MEMBER,
    Permission.REMOVE_MEMBER,
    Permission.CHANGE_MEMBER_ROLE,
    Permission.MANAGE_ORG,
    // Alertas
    Permission.VIEW_ALERTS,
    Permission.ACCEPT_ALERT,
    Permission.DISMISS_ALERT,
    // Integraciones
    Permission.VIEW_INTEGRATIONS,
    Permission.CONNECT_INTEGRATION,
    Permission.DISCONNECT_INTEGRATION,
    // Datos
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.EXPORT_DATA,
    Permission.IMPORT_CSV,
    // IA
    Permission.VIEW_AI_RECOMMENDATIONS,
    Permission.TRIGGER_AI_ANALYSIS,
    Permission.GENERATE_AI_DRAFT,
  ]),

  // ── IT_MANAGER: operaciones técnicas ─────────────────────────────
  [Role.IT_MANAGER]: new Set([
    // Dashboard
    Permission.VIEW_DASHBOARD,
    // Suscripciones (sin borrado físico)
    Permission.VIEW_SUBSCRIPTIONS,
    Permission.CREATE_SUBSCRIPTION,
    Permission.UPDATE_SUBSCRIPTION,
    Permission.CANCEL_SUBSCRIPTION,
    // Usuarios (solo lectura)
    Permission.VIEW_USERS,
    // Alertas
    Permission.VIEW_ALERTS,
    Permission.ACCEPT_ALERT,
    Permission.DISMISS_ALERT,
    // Integraciones
    Permission.VIEW_INTEGRATIONS,
    Permission.CONNECT_INTEGRATION,
    Permission.DISCONNECT_INTEGRATION,
    // Datos
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.EXPORT_DATA,
    Permission.IMPORT_CSV,
    // IA
    Permission.VIEW_AI_RECOMMENDATIONS,
    Permission.TRIGGER_AI_ANALYSIS,
    Permission.GENERATE_AI_DRAFT,
  ]),

  // ── READER: solo lectura ──────────────────────────────────────────
  [Role.READER]: new Set([
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SUBSCRIPTIONS,
    Permission.VIEW_USERS,
    Permission.VIEW_ALERTS,
    Permission.VIEW_INTEGRATIONS,
    Permission.VIEW_AI_RECOMMENDATIONS,
  ]),
};

// ─────────────────────────────────────────────
// Helper: verificar permiso de un rol
// ─────────────────────────────────────────────

/**
 * Comprueba si un rol tiene un permiso específico.
 * Útil para lógica condicional dentro de controladores.
 *
 * @example
 * if (hasRolePermission(user.role, Permission.ACCEPT_ALERT)) {
 *   // mostrar botón de aceptar
 * }
 */
export function hasRolePermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}
