/**
 * saas.routes.ts
 * Definición de rutas para el inventario SaaS de Onniik.
 *
 * Base path: /api/v1/saas
 *
 * ── PRODUCTOS (catálogo global) ──────────────────────────────────────────────
 *
 * ┌─────────┬──────────────────────────┬───────────────────────────┐
 * │ Método  │ Ruta                     │ Roles permitidos          │
 * ├─────────┼──────────────────────────┼───────────────────────────┤
 * │ GET     │ /products                │ Todos (requireAuth)       │
 * │ GET     │ /products/:id            │ Todos (requireAuth)       │
 * │ POST    │ /products                │ ADMIN + IT_MANAGER        │
 * │ PATCH   │ /products/:id            │ ADMIN                     │
 * │ DELETE  │ /products/:id            │ ADMIN                     │
 * └─────────┴──────────────────────────┴───────────────────────────┘
 *
 * ── SUSCRIPCIONES (inventario de la org) ────────────────────────────────────
 *
 * ┌─────────┬──────────────────────────┬───────────────────────────┐
 * │ Método  │ Ruta                     │ Roles permitidos          │
 * ├─────────┼──────────────────────────┼───────────────────────────┤
 * │ GET     │ /subscriptions           │ Todos (requireAuth)       │
 * │ GET     │ /subscriptions/:id       │ Todos (requireAuth)       │
 * │ POST    │ /subscriptions           │ ADMIN + IT_MANAGER        │
 * │ PATCH   │ /subscriptions/:id       │ ADMIN + IT_MANAGER        │
 * │ DELETE  │ /subscriptions/:id       │ ADMIN                     │
 * └─────────┴──────────────────────────┴───────────────────────────┘
 *
 * Tarea 81 — /api/v1/saas (CRUD base)
 * Tarea 82 — /api/v1/saas/subscriptions/summary    (KPIs por estado)
 *            /api/v1/saas/subscriptions/:id/status  (máquina de estados)
 */

import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
  getSubscriptionStatusSummary,
} from '../controllers/saas.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin, requireAdminOrItManager } from '../middlewares/rbac.middleware';

const router = Router();

// ════════════════════════════════════════════
// Rutas de PRODUCTOS (/api/v1/saas/products)
// ════════════════════════════════════════════

// GET /api/v1/saas/products — Lista paginada del catálogo global
router.get('/products', requireAuth, listProducts);

// GET /api/v1/saas/products/:id — Detalle de un producto del catálogo
router.get('/products/:id', requireAuth, getProduct);

// POST /api/v1/saas/products — Crear producto en el catálogo (ADMIN + IT_MANAGER)
router.post('/products', requireAuth, requireAdminOrItManager, createProduct);

// PATCH /api/v1/saas/products/:id — Actualizar producto del catálogo (solo ADMIN)
router.patch('/products/:id', requireAuth, requireAdmin, updateProduct);

// DELETE /api/v1/saas/products/:id — Eliminar producto del catálogo (solo ADMIN)
router.delete('/products/:id', requireAuth, requireAdmin, deleteProduct);

// ═══════════════════════════════════════════════
// Rutas de SUSCRIPCIONES (/api/v1/saas/subscriptions)
// ═══════════════════════════════════════════════

// GET /api/v1/saas/subscriptions/summary — KPIs y resumen por estado (Tarea 82)
// IMPORTANTE: debe estar ANTES de /subscriptions/:id para evitar conflicto de rutas
router.get('/subscriptions/summary', requireAuth, getSubscriptionStatusSummary);

// GET /api/v1/saas/subscriptions — Lista suscripciones de la org (con filtros)
router.get('/subscriptions', requireAuth, listSubscriptions);

// GET /api/v1/saas/subscriptions/:id — Detalle de una suscripción de la org
router.get('/subscriptions/:id', requireAuth, getSubscription);

// POST /api/v1/saas/subscriptions — Crear suscripción para la org (ADMIN + IT_MANAGER)
router.post('/subscriptions', requireAuth, requireAdminOrItManager, createSubscription);

// PATCH /api/v1/saas/subscriptions/:id/status — Cambiar estado con máquina de estados (Tarea 82)
// IMPORTANTE: debe estar ANTES de PATCH /subscriptions/:id para que Express no lo capture antes
router.patch(
  '/subscriptions/:id/status',
  requireAuth,
  requireAdminOrItManager,
  updateSubscriptionStatus
);

// PATCH /api/v1/saas/subscriptions/:id — Actualizar suscripción (ADMIN + IT_MANAGER)
router.patch('/subscriptions/:id', requireAuth, requireAdminOrItManager, updateSubscription);

// DELETE /api/v1/saas/subscriptions/:id — Eliminar suscripción de la org (solo ADMIN)
router.delete('/subscriptions/:id', requireAuth, requireAdmin, deleteSubscription);

export default router;
