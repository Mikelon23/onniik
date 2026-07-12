/**
 * saas.service.ts
 * Capa de lógica de negocio para el inventario SaaS de Onniik.
 *
 * Gestiona dos recursos estrechamente relacionados:
 *
 *   1. SaaSProduct — Catálogo global de herramientas SaaS conocidas por Onniik.
 *      Compartido entre todas las organizaciones. Representa la herramienta
 *      en sí (ej. "Slack"), no la suscripción.
 *
 *   2. SaaSSubscription — Suscripción activa (o histórica) de una organización
 *      a un producto del catálogo. Siempre filtrada por organizationId del
 *      usuario autenticado (aislamiento multi-tenant).
 *
 * SEGURIDAD:
 *   - Todas las queries de suscripciones incluyen `organizationId` como filtro
 *     obligatorio — nunca se accede a datos de otra organización.
 *   - El organizationId siempre proviene del JWT (req.user), nunca del body.
 *
 * Tarea 81 — /api/v1/saas
 */

import prisma from '../config/db';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError';
import { SaaSCategory, BillingCycle, SubscriptionStatus, DetectionSource } from '@prisma/client';

// ─────────────────────────────────────────────
// DTOs de entrada
// ─────────────────────────────────────────────

/** Campos para crear un nuevo producto en el catálogo global */
export interface CreateProductDto {
  name: string;
  slug: string;
  category?: SaaSCategory;
  description?: string;
  website?: string;
  logoUrl?: string;
  vendor?: string;
}

/** Campos actualizables de un producto del catálogo */
export interface UpdateProductDto {
  name?: string;
  slug?: string;
  category?: SaaSCategory;
  description?: string;
  website?: string;
  logoUrl?: string;
  vendor?: string;
}

/** Campos para crear una nueva suscripción de la organización */
export interface CreateSubscriptionDto {
  saasProductId: string;
  status?: SubscriptionStatus;
  detectionSource?: DetectionSource;
  ownerId?: string;
  seatCount?: number;
  activeSeats?: number;
  costPerSeat?: number;
  totalMonthlyCost?: number;
  currency?: string;
  billingCycle?: BillingCycle;
  renewalDate?: string; // ISO 8601
  contractStart?: string; // ISO 8601
  contractEnd?: string; // ISO 8601
  externalId?: string;
  notes?: string;
}

/** Campos actualizables de una suscripción */
export interface UpdateSubscriptionDto {
  status?: SubscriptionStatus;
  detectionSource?: DetectionSource;
  ownerId?: string | null;
  seatCount?: number | null;
  activeSeats?: number | null;
  costPerSeat?: number | null;
  totalMonthlyCost?: number | null;
  currency?: string;
  billingCycle?: BillingCycle;
  renewalDate?: string | null; // ISO 8601
  contractStart?: string | null; // ISO 8601
  contractEnd?: string | null; // ISO 8601
  externalId?: string | null;
  notes?: string | null;
}

/** Filtros opcionales para listar suscripciones */
export interface ListSubscriptionsFilter {
  status?: SubscriptionStatus;
  detectionSource?: DetectionSource;
  category?: SaaSCategory;
}

// ─────────────────────────────────────────────
// Proyección segura — SaaSProduct
// ─────────────────────────────────────────────

const PRODUCT_PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  category: true,
  description: true,
  website: true,
  logoUrl: true,
  vendor: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { subscriptions: true } },
} as const;

// ─────────────────────────────────────────────
// Proyección segura — SaaSSubscription
// ─────────────────────────────────────────────

const SUBSCRIPTION_PUBLIC_SELECT = {
  id: true,
  organizationId: true,
  saasProductId: true,
  saasProduct: {
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      logoUrl: true,
      vendor: true,
    },
  },
  ownerId: true,
  owner: {
    select: { id: true, name: true, email: true, role: true },
  },
  status: true,
  detectionSource: true,
  seatCount: true,
  activeSeats: true,
  costPerSeat: true,
  totalMonthlyCost: true,
  currency: true,
  billingCycle: true,
  renewalDate: true,
  contractStart: true,
  contractEnd: true,
  externalId: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─────────────────────────────────────────────
// SaaSService — Productos (catálogo global)
// ─────────────────────────────────────────────

export const SaaSProductService = {
  /**
   * Lista todos los productos del catálogo global con paginación.
   *
   * @param page  - Número de página (1-indexed, default: 1)
   * @param limit - Registros por página (default: 20, máx: 100)
   * @returns Array de productos y total de registros
   */
  async listProducts(page = 1, limit = 20) {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    const [products, total] = await prisma.$transaction([
      prisma.saaSProduct.findMany({
        select: PRODUCT_PUBLIC_SELECT,
        orderBy: { name: 'asc' },
        skip,
        take: safeLimit,
      }),
      prisma.saaSProduct.count(),
    ]);

    return { products, total, page, limit: safeLimit };
  },

  /**
   * Obtiene un producto del catálogo por su ID.
   *
   * @param productId - UUID del producto
   * @throws {NotFoundError} Si el producto no existe
   */
  async getProductById(productId: string) {
    const product = await prisma.saaSProduct.findUnique({
      where: { id: productId },
      select: PRODUCT_PUBLIC_SELECT,
    });

    if (!product) {
      throw new NotFoundError('El producto SaaS solicitado no existe en el catálogo.');
    }

    return product;
  },

  /**
   * Crea un nuevo producto en el catálogo global.
   * Valida unicidad de `name` y `slug` antes de insertar.
   *
   * @throws {ConflictError} Si ya existe un producto con el mismo nombre o slug
   */
  async createProduct(dto: CreateProductDto) {
    // Validar unicidad de name y slug
    const existing = await prisma.saaSProduct.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      const field = existing.name === dto.name ? 'nombre' : 'slug';
      throw new ConflictError(`Ya existe un producto en el catálogo con ese ${field}.`);
    }

    const product = await prisma.saaSProduct.create({
      data: {
        name: dto.name.trim(),
        slug: dto.slug.trim().toLowerCase(),
        category: dto.category ?? 'OTHER',
        description: dto.description?.trim() ?? null,
        website: dto.website?.trim() ?? null,
        logoUrl: dto.logoUrl?.trim() ?? null,
        vendor: dto.vendor?.trim() ?? null,
      },
      select: PRODUCT_PUBLIC_SELECT,
    });

    return product;
  },

  /**
   * Actualiza un producto del catálogo global.
   * Solo se actualizan los campos provistos en el DTO.
   *
   * @throws {NotFoundError} Si el producto no existe
   * @throws {ConflictError} Si el nuevo nombre/slug ya está tomado
   */
  async updateProduct(productId: string, dto: UpdateProductDto) {
    const existing = await prisma.saaSProduct.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundError('El producto SaaS solicitado no existe en el catálogo.');
    }

    // Verificar conflictos de unicidad solo si se están cambiando name o slug
    if (dto.name || dto.slug) {
      const orConditions = [];
      if (dto.name) orConditions.push({ name: dto.name });
      if (dto.slug) orConditions.push({ slug: dto.slug });

      const conflict = await prisma.saaSProduct.findFirst({
        where: { OR: orConditions, NOT: { id: productId } },
        select: { id: true, name: true, slug: true },
      });

      if (conflict) {
        const field = dto.name && conflict.name === dto.name ? 'nombre' : 'slug';
        throw new ConflictError(`Ya existe otro producto en el catálogo con ese ${field}.`);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.slug !== undefined) updateData.slug = dto.slug.trim().toLowerCase();
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.description !== undefined) updateData.description = dto.description?.trim() ?? null;
    if (dto.website !== undefined) updateData.website = dto.website?.trim() ?? null;
    if (dto.logoUrl !== undefined) updateData.logoUrl = dto.logoUrl?.trim() ?? null;
    if (dto.vendor !== undefined) updateData.vendor = dto.vendor?.trim() ?? null;

    const product = await prisma.saaSProduct.update({
      where: { id: productId },
      data: updateData,
      select: PRODUCT_PUBLIC_SELECT,
    });

    return product;
  },

  /**
   * Elimina un producto del catálogo global.
   * Falla con Prisma P2003 si hay suscripciones activas (onDelete: Restrict).
   *
   * @throws {NotFoundError} Si el producto no existe
   */
  async deleteProduct(productId: string) {
    const existing = await prisma.saaSProduct.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw new NotFoundError('El producto SaaS solicitado no existe en el catálogo.');
    }

    await prisma.saaSProduct.delete({ where: { id: productId } });

    return { id: productId, name: existing.name };
  },
};

// ─────────────────────────────────────────────
// SaaSService — Suscripciones (scoped por org)
// ─────────────────────────────────────────────

export const SaaSSubscriptionService = {
  /**
   * Lista las suscripciones de una organización con filtros opcionales y paginación.
   * Siempre filtra por organizationId — aislamiento multi-tenant garantizado.
   *
   * @param orgId   - UUID de la organización (del JWT)
   * @param filter  - Filtros opcionales por status, source o categoría
   * @param page    - Número de página (1-indexed)
   * @param limit   - Registros por página (máx: 100)
   */
  async listSubscriptions(
    orgId: string,
    filter: ListSubscriptionsFilter = {},
    page = 1,
    limit = 20
  ) {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    const where: Record<string, unknown> = { organizationId: orgId };
    if (filter.status) where.status = filter.status;
    if (filter.detectionSource) where.detectionSource = filter.detectionSource;
    if (filter.category) {
      where.saasProduct = { category: filter.category };
    }

    const [subscriptions, total] = await prisma.$transaction([
      prisma.saaSSubscription.findMany({
        where,
        select: SUBSCRIPTION_PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      prisma.saaSSubscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit: safeLimit };
  },

  /**
   * Obtiene el detalle completo de una suscripción.
   * Valida que pertenezca a la organización del usuario (seguridad multi-tenant).
   *
   * @throws {NotFoundError} Si no existe o pertenece a otra organización
   */
  async getSubscriptionById(subscriptionId: string, orgId: string) {
    const subscription = await prisma.saaSSubscription.findUnique({
      where: { id: subscriptionId },
      select: SUBSCRIPTION_PUBLIC_SELECT,
    });

    if (!subscription || subscription.organizationId !== orgId) {
      throw new NotFoundError('La suscripción solicitada no existe.');
    }

    return subscription;
  },

  /**
   * Crea una nueva suscripción para la organización.
   *
   * Validaciones:
   *   - El producto SaaS debe existir en el catálogo
   *   - El ownerId (si se provee) debe pertenecer a la misma organización
   *   - Respeta la restricción única (org + producto + externalId)
   *
   * @throws {BadRequestError} Si el producto no existe o el owner no es de la org
   * @throws {ConflictError}   Si ya existe la combinación org+producto+externalId
   */
  async createSubscription(orgId: string, dto: CreateSubscriptionDto) {
    // 1. Verificar que el producto existe en el catálogo
    const product = await prisma.saaSProduct.findUnique({
      where: { id: dto.saasProductId },
      select: { id: true },
    });

    if (!product) {
      throw new BadRequestError(
        'El producto SaaS especificado no existe en el catálogo. Crea el producto primero.'
      );
    }

    // 2. Verificar que el owner pertenece a la organización (si se especificó)
    if (dto.ownerId) {
      const ownerUser = await prisma.user.findFirst({
        where: { id: dto.ownerId, organizationId: orgId },
        select: { id: true },
      });

      if (!ownerUser) {
        throw new BadRequestError(
          'El usuario designado como responsable no pertenece a esta organización.'
        );
      }
    }

    const subscription = await prisma.saaSSubscription.create({
      data: {
        organizationId: orgId,
        saasProductId: dto.saasProductId,
        ownerId: dto.ownerId ?? null,
        status: dto.status ?? 'ACTIVE',
        detectionSource: dto.detectionSource ?? 'MANUAL_ENTRY',
        seatCount: dto.seatCount ?? null,
        activeSeats: dto.activeSeats ?? null,
        costPerSeat: dto.costPerSeat ?? null,
        totalMonthlyCost: dto.totalMonthlyCost ?? null,
        currency: dto.currency ?? 'USD',
        billingCycle: dto.billingCycle ?? 'MONTHLY',
        renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : null,
        contractStart: dto.contractStart ? new Date(dto.contractStart) : null,
        contractEnd: dto.contractEnd ? new Date(dto.contractEnd) : null,
        externalId: dto.externalId ?? null,
        notes: dto.notes?.trim() ?? null,
      },
      select: SUBSCRIPTION_PUBLIC_SELECT,
    });

    return subscription;
  },

  /**
   * Actualiza los campos de una suscripción existente.
   * Solo actualiza los campos provistos. Valida pertenencia a la org.
   *
   * @throws {NotFoundError}   Si la suscripción no existe o es de otra org
   * @throws {BadRequestError} Si el nuevo ownerId no es de la organización
   */
  async updateSubscription(subscriptionId: string, orgId: string, dto: UpdateSubscriptionDto) {
    // Verificar existencia y pertenencia a la org
    const existing = await prisma.saaSSubscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, organizationId: true },
    });

    if (!existing || existing.organizationId !== orgId) {
      throw new NotFoundError('La suscripción solicitada no existe.');
    }

    // Validar owner si se está cambiando
    if (dto.ownerId !== undefined && dto.ownerId !== null) {
      const ownerUser = await prisma.user.findFirst({
        where: { id: dto.ownerId, organizationId: orgId },
        select: { id: true },
      });

      if (!ownerUser) {
        throw new BadRequestError(
          'El usuario designado como responsable no pertenece a esta organización.'
        );
      }
    }

    // Construir objeto de actualización solo con campos provistos
    const updateData: Record<string, unknown> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.detectionSource !== undefined) updateData.detectionSource = dto.detectionSource;
    if ('ownerId' in dto) updateData.ownerId = dto.ownerId;
    if ('seatCount' in dto) updateData.seatCount = dto.seatCount;
    if ('activeSeats' in dto) updateData.activeSeats = dto.activeSeats;
    if ('costPerSeat' in dto) updateData.costPerSeat = dto.costPerSeat;
    if ('totalMonthlyCost' in dto) updateData.totalMonthlyCost = dto.totalMonthlyCost;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.billingCycle !== undefined) updateData.billingCycle = dto.billingCycle;
    if ('renewalDate' in dto)
      updateData.renewalDate = dto.renewalDate ? new Date(dto.renewalDate) : null;
    if ('contractStart' in dto)
      updateData.contractStart = dto.contractStart ? new Date(dto.contractStart) : null;
    if ('contractEnd' in dto)
      updateData.contractEnd = dto.contractEnd ? new Date(dto.contractEnd) : null;
    if ('externalId' in dto) updateData.externalId = dto.externalId;
    if ('notes' in dto) updateData.notes = dto.notes?.trim() ?? null;

    const subscription = await prisma.saaSSubscription.update({
      where: { id: subscriptionId },
      data: updateData,
      select: SUBSCRIPTION_PUBLIC_SELECT,
    });

    return subscription;
  },

  /**
   * Elimina físicamente una suscripción de la organización.
   * Valida que pertenezca a la organización antes de eliminar.
   *
   * @throws {NotFoundError} Si la suscripción no existe o es de otra org
   */
  async deleteSubscription(subscriptionId: string, orgId: string) {
    const existing = await prisma.saaSSubscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, organizationId: true, saasProduct: { select: { name: true } } },
    });

    if (!existing || existing.organizationId !== orgId) {
      throw new NotFoundError('La suscripción solicitada no existe.');
    }

    await prisma.saaSSubscription.delete({ where: { id: subscriptionId } });

    return { id: subscriptionId, productName: existing.saasProduct.name };
  },
};
