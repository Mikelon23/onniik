/**
 * saas.controller.test.ts
 * Pruebas unitarias para los controladores de productos y suscripciones SaaS (saas.controller.ts).
 *
 * Cobertura de controladores:
 *   - Productos SaaS (catálogo global):
 *       • listProducts
 *       • getProduct
 *       • createProduct
 *       • updateProduct
 *       • deleteProduct
 *   - Suscripciones SaaS (inventario por organización):
 *       • listSubscriptions
 *       • getSubscription
 *       • createSubscription
 *       • updateSubscription
 *       • deleteSubscription
 *       • updateSubscriptionStatus (máquina de estados)
 *       • getSubscriptionStatusSummary (KPIs para Dashboard)
 *   - Manejo de excepciones y propagación a next(error)
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
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
} from '../saas.controller';
import { SaaSProductService, SaaSSubscriptionService } from '../../services/saas.service';
import { NotFoundError, BadRequestError } from '../../errors/AppError';

// Mockear la capa de servicio completa
jest.mock('../../services/saas.service');

describe('SaaS Controller (saas.controller.ts)', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  const mockOrgId = 'org_uuid_123456';
  const mockProductId = 'prod_uuid_987654';
  const mockSubscriptionId = 'sub_uuid_456789';

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      params: {},
      body: {},
      user: {
        id: 'usr_uuid_111',
        email: 'admin@onniik.com',
        role: 'ADMIN',
        organizationId: mockOrgId,
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn() as jest.MockedFunction<NextFunction>;
  });

  // ═════════════════════════════════════════════
  // PRODUCTOS SAAS (Catálogo Global)
  // ═════════════════════════════════════════════

  describe('PRODUCTOS SAAS', () => {
    describe('listProducts', () => {
      it('debe listar productos con paginación por defecto (página 1, límite 20) y responder 200', async () => {
        const mockResult = {
          products: [{ id: mockProductId, name: 'Slack' }],
          total: 1,
          page: 1,
          limit: 20,
        };
        (SaaSProductService.listProducts as jest.Mock).mockResolvedValue(mockResult);

        await listProducts(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.listProducts).toHaveBeenCalledWith(1, 20);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          data: mockResult,
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('debe parsear adecuadamente los parámetros de consulta ?page=2&limit=10', async () => {
        mockReq.query = { page: '2', limit: '10' };
        const mockResult = { products: [], total: 0, page: 2, limit: 10 };
        (SaaSProductService.listProducts as jest.Mock).mockResolvedValue(mockResult);

        await listProducts(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.listProducts).toHaveBeenCalledWith(2, 10);
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });

      it('debe capturar un error en el servicio y llamar a next(error)', async () => {
        const dbError = new Error('Error de conexión con la base de datos');
        (SaaSProductService.listProducts as jest.Mock).mockRejectedValue(dbError);

        await listProducts(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(dbError);
      });
    });

    describe('getProduct', () => {
      it('debe obtener el detalle de un producto por ID y retornar 200', async () => {
        mockReq.params = { id: mockProductId };
        const mockProduct = { id: mockProductId, name: 'Slack', slug: 'slack' };
        (SaaSProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);

        await getProduct(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.getProductById).toHaveBeenCalledWith(mockProductId);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          data: { product: mockProduct },
        });
      });

      it('debe llamar a next con NotFoundError si el producto no existe', async () => {
        mockReq.params = { id: 'invalido' };
        const error = new NotFoundError('El producto SaaS solicitado no existe en el catálogo.');
        (SaaSProductService.getProductById as jest.Mock).mockRejectedValue(error);

        await getProduct(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe('createProduct', () => {
      it('debe crear un nuevo producto en el catálogo y responder 201', async () => {
        const body = { name: 'Figma', slug: 'figma', category: 'DESIGN' };
        mockReq.body = body;

        const createdProduct = { id: mockProductId, ...body };
        (SaaSProductService.createProduct as jest.Mock).mockResolvedValue(createdProduct);

        await createProduct(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.createProduct).toHaveBeenCalledWith({
          name: 'Figma',
          slug: 'figma',
          category: 'DESIGN',
          description: undefined,
          website: undefined,
          logoUrl: undefined,
          vendor: undefined,
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Producto creado en el catálogo exitosamente.',
          data: { product: createdProduct },
        });
      });
    });

    describe('updateProduct', () => {
      it('debe actualizar un producto y retornar 200', async () => {
        mockReq.params = { id: mockProductId };
        mockReq.body = { description: 'Nueva descripción de Figma' };

        const updatedProduct = {
          id: mockProductId,
          name: 'Figma',
          description: 'Nueva descripción de Figma',
        };
        (SaaSProductService.updateProduct as jest.Mock).mockResolvedValue(updatedProduct);

        await updateProduct(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.updateProduct).toHaveBeenCalledWith(mockProductId, {
          description: 'Nueva descripción de Figma',
          name: undefined,
          slug: undefined,
          category: undefined,
          website: undefined,
          logoUrl: undefined,
          vendor: undefined,
        });
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('deleteProduct', () => {
      it('debe eliminar un producto del catálogo y retornar 200', async () => {
        mockReq.params = { id: mockProductId };
        (SaaSProductService.deleteProduct as jest.Mock).mockResolvedValue({
          id: mockProductId,
          name: 'Figma',
        });

        await deleteProduct(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSProductService.deleteProduct).toHaveBeenCalledWith(mockProductId);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Producto "Figma" eliminado del catálogo exitosamente.',
          data: { id: mockProductId },
        });
      });
    });
  });

  // ═════════════════════════════════════════════
  // SUSCRIPCIONES SAAS (Organización)
  // ═════════════════════════════════════════════

  describe('SUSCRIPCIONES SAAS', () => {
    describe('listSubscriptions', () => {
      it('debe listar suscripciones asociadas al organizationId del usuario autenticado', async () => {
        mockReq.query = { status: 'ACTIVE' };
        const mockResult = {
          subscriptions: [{ id: mockSubscriptionId, status: 'ACTIVE' }],
          total: 1,
          page: 1,
          limit: 20,
        };
        (SaaSSubscriptionService.listSubscriptions as jest.Mock).mockResolvedValue(mockResult);

        await listSubscriptions(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSSubscriptionService.listSubscriptions).toHaveBeenCalledWith(
          mockOrgId,
          { status: 'ACTIVE', detectionSource: undefined, category: undefined },
          1,
          20
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          data: mockResult,
        });
      });
    });

    describe('getSubscription', () => {
      it('debe retornar los detalles de una suscripción perteneciente a la org y responder 200', async () => {
        mockReq.params = { id: mockSubscriptionId };
        const mockSubscription = {
          id: mockSubscriptionId,
          organizationId: mockOrgId,
          status: 'ACTIVE',
        };
        (SaaSSubscriptionService.getSubscriptionById as jest.Mock).mockResolvedValue(
          mockSubscription
        );

        await getSubscription(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSSubscriptionService.getSubscriptionById).toHaveBeenCalledWith(
          mockSubscriptionId,
          mockOrgId
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          data: { subscription: mockSubscription },
        });
      });
    });

    describe('createSubscription', () => {
      it('debe crear una suscripción usando el organizationId del JWT y parsear numéricos adecuadamente', async () => {
        mockReq.body = {
          saasProductId: mockProductId,
          seatCount: '25',
          costPerSeat: '10',
          totalMonthlyCost: '250',
          currency: 'USD',
        };

        const createdSub = {
          id: mockSubscriptionId,
          organizationId: mockOrgId,
          seatCount: 25,
          totalMonthlyCost: 250,
        };
        (SaaSSubscriptionService.createSubscription as jest.Mock).mockResolvedValue(createdSub);

        await createSubscription(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSSubscriptionService.createSubscription).toHaveBeenCalledWith(mockOrgId, {
          saasProductId: mockProductId,
          status: undefined,
          detectionSource: undefined,
          ownerId: undefined,
          seatCount: 25,
          activeSeats: undefined,
          costPerSeat: 10,
          totalMonthlyCost: 250,
          currency: 'USD',
          billingCycle: undefined,
          renewalDate: undefined,
          contractStart: undefined,
          contractEnd: undefined,
          externalId: undefined,
          notes: undefined,
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Suscripción creada exitosamente.',
          data: { subscription: createdSub },
        });
      });
    });

    describe('updateSubscription', () => {
      it('debe actualizar los datos de la suscripción filtrados por organizationId', async () => {
        mockReq.params = { id: mockSubscriptionId };
        mockReq.body = { seatCount: 50 };

        const updatedSub = { id: mockSubscriptionId, seatCount: 50 };
        (SaaSSubscriptionService.updateSubscription as jest.Mock).mockResolvedValue(updatedSub);

        await updateSubscription(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSSubscriptionService.updateSubscription).toHaveBeenCalledWith(
          mockSubscriptionId,
          mockOrgId,
          { seatCount: 50 }
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('deleteSubscription', () => {
      it('debe eliminar la suscripción especificada y retornar 200', async () => {
        mockReq.params = { id: mockSubscriptionId };
        (SaaSSubscriptionService.deleteSubscription as jest.Mock).mockResolvedValue({
          id: mockSubscriptionId,
          productName: 'Slack',
        });

        await deleteSubscription(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

        expect(SaaSSubscriptionService.deleteSubscription).toHaveBeenCalledWith(
          mockSubscriptionId,
          mockOrgId
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Suscripción de "Slack" eliminada exitosamente.',
          data: { id: mockSubscriptionId },
        });
      });
    });

    describe('updateSubscriptionStatus', () => {
      it('debe actualizar el estado de una suscripción registrando la transición', async () => {
        mockReq.params = { id: mockSubscriptionId };
        mockReq.body = { status: 'CANCELLED', reason: 'Sin uso' };

        const mockResult = {
          subscription: { id: mockSubscriptionId, status: 'CANCELLED' },
          transition: { from: 'ACTIVE', to: 'CANCELLED', productName: 'Slack', reason: 'Sin uso' },
        };
        (SaaSSubscriptionService.updateSubscriptionStatus as jest.Mock).mockResolvedValue(
          mockResult
        );

        await updateSubscriptionStatus(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(SaaSSubscriptionService.updateSubscriptionStatus).toHaveBeenCalledWith(
          mockSubscriptionId,
          mockOrgId,
          {
            status: 'CANCELLED',
            reason: 'Sin uso',
          }
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Estado de suscripción actualizado: ACTIVE → CANCELLED.',
          data: mockResult,
        });
      });

      it('debe pasar BadRequestError a next si la transición de estado es inválida', async () => {
        mockReq.params = { id: mockSubscriptionId };
        mockReq.body = { status: 'ACTIVE' };

        const error = new BadRequestError('La suscripción está cancelada (estado terminal).');
        (SaaSSubscriptionService.updateSubscriptionStatus as jest.Mock).mockRejectedValue(error);

        await updateSubscriptionStatus(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe('getSubscriptionStatusSummary', () => {
      it('debe obtener los KPIs y métricas de suscripción agrupadas por estado', async () => {
        const mockSummaryResult = {
          summary: {
            ACTIVE: { count: 5, totalMonthlyCost: 1000, totalSeats: 50, activeSeats: 40 },
          },
          kpis: {
            totalSubscriptions: 5,
            activeCount: 5,
            totalMonthlySpend: 1000,
            shadowItCount: 0,
            pendingReviewCount: 0,
            inactiveCount: 0,
            cancelledCount: 0,
          },
        };
        (SaaSSubscriptionService.getSubscriptionStatusSummary as jest.Mock).mockResolvedValue(
          mockSummaryResult
        );

        await getSubscriptionStatusSummary(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(SaaSSubscriptionService.getSubscriptionStatusSummary).toHaveBeenCalledWith(
          mockOrgId
        );
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'success',
          data: mockSummaryResult,
        });
      });
    });
  });
});
