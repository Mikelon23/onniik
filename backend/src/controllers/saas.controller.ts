/**
 * saas.controller.ts
 * Controladores HTTP para el inventario SaaS de Onniik.
 *
 * Gestiona dos recursos:
 *   1. Productos SaaS  — catálogo global compartido entre organizaciones
 *   2. Suscripciones   — inventario privado de una organización específica
 *
 * Todos los controladores delegan la lógica de negocio a saas.service.ts.
 * El control de acceso por roles (RBAC) se aplica en la capa de rutas.
 *
 * Tarea 81 — /api/v1/saas
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SaaSProductService, SaaSSubscriptionService } from '../services/saas.service';
import { BadRequestError } from '../errors/AppError';
import { SaaSCategory, BillingCycle, SubscriptionStatus, DetectionSource } from '@prisma/client';

// ─────────────────────────────────────────────
// Helper: parsear parámetros de paginación
// ─────────────────────────────────────────────

function parsePagination(query: Record<string, unknown>): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10) || 20));
  return { page, limit };
}

// ═════════════════════════════════════════════
// PRODUCTOS — Catálogo global
// ═════════════════════════════════════════════

/**
 * GET /api/v1/saas/products
 * Lista todos los productos del catálogo global con paginación.
 *
 * Query params:
 *   - page  (number, default: 1)
 *   - limit (number, default: 20, máx: 100)
 *
 * Acceso: todos los roles autenticados
 */
export const listProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const result = await SaaSProductService.listProducts(page, limit);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/saas/products/:id
 * Obtiene el detalle de un producto del catálogo por su UUID.
 *
 * Acceso: todos los roles autenticados
 */
export const getProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const product = await SaaSProductService.getProductById(id);

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/saas/products
 * Crea un nuevo producto en el catálogo global.
 *
 * Body requerido: { name, slug }
 * Body opcional:  { category, description, website, logoUrl, vendor }
 *
 * Acceso: ADMIN, IT_MANAGER
 */
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, category, description, website, logoUrl, vendor } = req.body;

    if (!name || !slug) {
      throw new BadRequestError('Los campos name y slug son requeridos para crear un producto.');
    }

    if (category && !Object.values(SaaSCategory).includes(category as SaaSCategory)) {
      throw new BadRequestError(
        `Categoría inválida. Valores permitidos: ${Object.values(SaaSCategory).join(', ')}`
      );
    }

    const product = await SaaSProductService.createProduct({
      name,
      slug,
      category,
      description,
      website,
      logoUrl,
      vendor,
    });

    res.status(201).json({
      status: 'success',
      message: 'Producto creado en el catálogo exitosamente.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/saas/products/:id
 * Actualiza un producto del catálogo global.
 * Solo se actualizan los campos enviados en el body.
 *
 * Acceso: ADMIN
 */
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const { name, slug, category, description, website, logoUrl, vendor } = req.body;

    if (Object.keys(req.body).length === 0) {
      throw new BadRequestError('Se debe proporcionar al menos un campo para actualizar.');
    }

    if (category && !Object.values(SaaSCategory).includes(category as SaaSCategory)) {
      throw new BadRequestError(
        `Categoría inválida. Valores permitidos: ${Object.values(SaaSCategory).join(', ')}`
      );
    }

    const product = await SaaSProductService.updateProduct(id, {
      name,
      slug,
      category,
      description,
      website,
      logoUrl,
      vendor,
    });

    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/saas/products/:id
 * Elimina un producto del catálogo global.
 * Falla si existen suscripciones activas asociadas (integridad referencial).
 *
 * Acceso: ADMIN
 */
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const deleted = await SaaSProductService.deleteProduct(id);

    res.status(200).json({
      status: 'success',
      message: `Producto "${deleted.name}" eliminado del catálogo exitosamente.`,
      data: { id: deleted.id },
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════
// SUSCRIPCIONES — Inventario de la organización
// ═════════════════════════════════════════════

/**
 * GET /api/v1/saas/subscriptions
 * Lista las suscripciones de la organización del usuario autenticado.
 *
 * Query params:
 *   - page             (number, default: 1)
 *   - limit            (number, default: 20, máx: 100)
 *   - status           (SubscriptionStatus)
 *   - detectionSource  (DetectionSource)
 *   - category         (SaaSCategory)
 *
 * Acceso: todos los roles autenticados
 */
export const listSubscriptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);

    const { status, detectionSource, category } = req.query as Record<string, string | undefined>;

    const result = await SaaSSubscriptionService.listSubscriptions(
      orgId,
      {
        status: status as SubscriptionStatus | undefined,
        detectionSource: detectionSource as DetectionSource | undefined,
        category: category as SaaSCategory | undefined,
      },
      page,
      limit
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/saas/subscriptions/:id
 * Obtiene el detalle de una suscripción de la organización.
 * Valida que pertenezca a la org del usuario autenticado.
 *
 * Acceso: todos los roles autenticados
 */
export const getSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    const subscription = await SaaSSubscriptionService.getSubscriptionById(id, orgId);

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/saas/subscriptions
 * Crea una nueva suscripción para la organización del usuario autenticado.
 *
 * Body requerido: { saasProductId }
 * Body opcional:  { status, detectionSource, ownerId, seatCount, activeSeats,
 *                   costPerSeat, totalMonthlyCost, currency, billingCycle,
 *                   renewalDate, contractStart, contractEnd, externalId, notes }
 *
 * SEGURIDAD: el organizationId siempre proviene del JWT, nunca del body.
 *
 * Acceso: ADMIN, IT_MANAGER
 */
export const createSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const {
      saasProductId,
      status,
      detectionSource,
      ownerId,
      seatCount,
      activeSeats,
      costPerSeat,
      totalMonthlyCost,
      currency,
      billingCycle,
      renewalDate,
      contractStart,
      contractEnd,
      externalId,
      notes,
    } = req.body;

    if (!saasProductId) {
      throw new BadRequestError('El campo saasProductId es requerido.');
    }

    if (status && !Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
      throw new BadRequestError(
        `Estado inválido. Valores permitidos: ${Object.values(SubscriptionStatus).join(', ')}`
      );
    }

    if (billingCycle && !Object.values(BillingCycle).includes(billingCycle as BillingCycle)) {
      throw new BadRequestError(
        `Ciclo de facturación inválido. Valores permitidos: ${Object.values(BillingCycle).join(', ')}`
      );
    }

    const subscription = await SaaSSubscriptionService.createSubscription(orgId, {
      saasProductId,
      status,
      detectionSource,
      ownerId,
      seatCount: seatCount !== undefined ? Number(seatCount) : undefined,
      activeSeats: activeSeats !== undefined ? Number(activeSeats) : undefined,
      costPerSeat: costPerSeat !== undefined ? Number(costPerSeat) : undefined,
      totalMonthlyCost: totalMonthlyCost !== undefined ? Number(totalMonthlyCost) : undefined,
      currency,
      billingCycle,
      renewalDate,
      contractStart,
      contractEnd,
      externalId,
      notes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Suscripción creada exitosamente.',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/saas/subscriptions/:id
 * Actualiza una suscripción de la organización.
 * Solo se modifican los campos provistos en el body.
 *
 * Acceso: ADMIN, IT_MANAGER
 */
export const updateSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    if (Object.keys(req.body).length === 0) {
      throw new BadRequestError('Se debe proporcionar al menos un campo para actualizar.');
    }

    const subscription = await SaaSSubscriptionService.updateSubscription(id, orgId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Suscripción actualizada exitosamente.',
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/saas/subscriptions/:id
 * Elimina físicamente una suscripción de la organización.
 * Requiere que pertenezca a la organización del usuario autenticado.
 *
 * Acceso: ADMIN
 */
export const deleteSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { id } = req.params as Record<string, string>;

    const deleted = await SaaSSubscriptionService.deleteSubscription(id, orgId);

    res.status(200).json({
      status: 'success',
      message: `Suscripción de "${deleted.productName}" eliminada exitosamente.`,
      data: { id: deleted.id },
    });
  } catch (error) {
    next(error);
  }
};
