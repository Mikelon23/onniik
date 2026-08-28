/**
 * rbac.middleware.test.ts
 * Pruebas unitarias para el middleware de control de acceso basado en roles (rbac.middleware.ts).
 *
 * Cobertura de funciones:
 *   - assertAuthenticated (protección ante peticiones no autenticadas sin req.user)
 *   - requireAdmin
 *   - requireItManager
 *   - requireAdminOrItManager
 *   - requirePermission (validación granular por permiso)
 *   - Aliases semánticos por dominio:
 *       • requireCanManageAlerts
 *       • requireCanManageSubscriptions
 *       • requireCanManageIntegrations
 *       • requireCanViewLogs
 *       • requireCanUseAI
 *   - Helper: hasRolePermission
 */

import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth.middleware';
import {
  requireAdmin,
  requireItManager,
  requireAdminOrItManager,
  requirePermission,
  requireCanManageAlerts,
  requireCanManageSubscriptions,
  requireCanManageIntegrations,
  requireCanViewLogs,
  requireCanUseAI,
  hasRolePermission,
} from '../rbac.middleware';
import { Permission } from '../../types/rbac.types';
import { UnauthorizedError, ForbiddenError } from '../../errors/AppError';

describe('RBAC Middleware (rbac.middleware.ts)', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {};
    mockRes = {};
    mockNext = jest.fn() as jest.MockedFunction<NextFunction>;
  });

  // ═════════════════════════════════════════════
  // 1. Protección de Autenticación Previa (assertAuthenticated)
  // ═════════════════════════════════════════════

  describe('Protección si req.user no existe (assertAuthenticated)', () => {
    it('debe pasar un UnauthorizedError a next() si req.user es undefined', () => {
      mockReq.user = undefined;

      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = mockNext.mock.calls[0][0] as unknown as UnauthorizedError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Error de configuración');
    });
  });

  // ═════════════════════════════════════════════
  // 2. requireAdmin
  // ═════════════════════════════════════════════

  describe('requireAdmin', () => {
    it('debe permitir el acceso (llamar a next sin error) cuando el usuario es ADMIN', () => {
      mockReq.user = {
        id: 'u1',
        email: 'admin@onniik.com',
        role: Role.ADMIN,
        organizationId: 'org1',
      };

      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe denegar el acceso (llamar a next con ForbiddenError) cuando el usuario es IT_MANAGER', () => {
      mockReq.user = {
        id: 'u2',
        email: 'it@onniik.com',
        role: Role.IT_MANAGER,
        organizationId: 'org1',
      };

      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.statusCode).toBe(403);
    });

    it('debe denegar el acceso (llamar a next con ForbiddenError) cuando el usuario es READER', () => {
      mockReq.user = {
        id: 'u3',
        email: 'reader@onniik.com',
        role: Role.READER,
        organizationId: 'org1',
      };

      requireAdmin(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.statusCode).toBe(403);
    });
  });

  // ═════════════════════════════════════════════
  // 3. requireItManager
  // ═════════════════════════════════════════════

  describe('requireItManager', () => {
    it('debe permitir el acceso cuando el usuario es IT_MANAGER', () => {
      mockReq.user = {
        id: 'u2',
        email: 'it@onniik.com',
        role: Role.IT_MANAGER,
        organizationId: 'org1',
      };

      requireItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe denegar el acceso cuando el usuario es ADMIN', () => {
      mockReq.user = {
        id: 'u1',
        email: 'admin@onniik.com',
        role: Role.ADMIN,
        organizationId: 'org1',
      };

      requireItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('debe denegar el acceso cuando el usuario es READER', () => {
      mockReq.user = {
        id: 'u3',
        email: 'reader@onniik.com',
        role: Role.READER,
        organizationId: 'org1',
      };

      requireItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  // ═════════════════════════════════════════════
  // 4. requireAdminOrItManager
  // ═════════════════════════════════════════════

  describe('requireAdminOrItManager', () => {
    it('debe permitir el acceso a un usuario con rol ADMIN', () => {
      mockReq.user = {
        id: 'u1',
        email: 'admin@onniik.com',
        role: Role.ADMIN,
        organizationId: 'org1',
      };

      requireAdminOrItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe permitir el acceso a un usuario con rol IT_MANAGER', () => {
      mockReq.user = {
        id: 'u2',
        email: 'it@onniik.com',
        role: Role.IT_MANAGER,
        organizationId: 'org1',
      };

      requireAdminOrItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe denegar el acceso (403) a un usuario con rol READER', () => {
      mockReq.user = {
        id: 'u3',
        email: 'reader@onniik.com',
        role: Role.READER,
        organizationId: 'org1',
      };

      requireAdminOrItManager(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  // ═════════════════════════════════════════════
  // 5. requirePermission (Permisos Granulares)
  // ═════════════════════════════════════════════

  describe('requirePermission', () => {
    it('debe permitir el acceso si el rol del usuario posee el permiso especificado', () => {
      mockReq.user = {
        id: 'u1',
        email: 'admin@onniik.com',
        role: Role.ADMIN,
        organizationId: 'org1',
      };
      const middleware = requirePermission(Permission.MANAGE_ORG);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe permitir a READER un permiso de solo lectura (VIEW_DASHBOARD)', () => {
      mockReq.user = {
        id: 'u3',
        email: 'reader@onniik.com',
        role: Role.READER,
        organizationId: 'org1',
      };
      const middleware = requirePermission(Permission.VIEW_DASHBOARD);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('debe denegar el acceso (403) si el rol no posee el permiso especificado', () => {
      mockReq.user = {
        id: 'u3',
        email: 'reader@onniik.com',
        role: Role.READER,
        organizationId: 'org1',
      };
      const middleware = requirePermission(Permission.DELETE_SUBSCRIPTION);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      const error = mockNext.mock.calls[0][0] as unknown as ForbiddenError;
      expect(error.message).toContain(
        "El rol 'READER' no tiene el permiso requerido: 'delete:subscription'"
      );
    });

    it('debe denegar el acceso (403) a IT_MANAGER para un permiso exclusivo de ADMIN (MANAGE_ORG)', () => {
      mockReq.user = {
        id: 'u2',
        email: 'it@onniik.com',
        role: Role.IT_MANAGER,
        organizationId: 'org1',
      };
      const middleware = requirePermission(Permission.MANAGE_ORG);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('debe retornar 401 si req.user es undefined al ejecutar requirePermission', () => {
      mockReq.user = undefined;
      const middleware = requirePermission(Permission.VIEW_DASHBOARD);

      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  // ═════════════════════════════════════════════
  // 6. Aliases por Dominio Semántico
  // ═════════════════════════════════════════════

  describe('Aliases por Dominio Semántico', () => {
    const testCases = [
      { name: 'requireCanManageAlerts', middleware: requireCanManageAlerts },
      { name: 'requireCanManageSubscriptions', middleware: requireCanManageSubscriptions },
      { name: 'requireCanManageIntegrations', middleware: requireCanManageIntegrations },
      { name: 'requireCanViewLogs', middleware: requireCanViewLogs },
      { name: 'requireCanUseAI', middleware: requireCanUseAI },
    ];

    testCases.forEach(({ name, middleware }) => {
      describe(name, () => {
        it('debe permitir el acceso a ADMIN', () => {
          mockReq.user = {
            id: 'u1',
            email: 'admin@onniik.com',
            role: Role.ADMIN,
            organizationId: 'org1',
          };
          middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
          expect(mockNext).toHaveBeenCalledWith();
        });

        it('debe permitir el acceso a IT_MANAGER', () => {
          mockReq.user = {
            id: 'u2',
            email: 'it@onniik.com',
            role: Role.IT_MANAGER,
            organizationId: 'org1',
          };
          middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
          expect(mockNext).toHaveBeenCalledWith();
        });

        it('debe denegar el acceso (403) a READER', () => {
          mockReq.user = {
            id: 'u3',
            email: 'reader@onniik.com',
            role: Role.READER,
            organizationId: 'org1',
          };
          middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);
          expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
        });
      });
    });
  });

  // ═════════════════════════════════════════════
  // 7. Helper: hasRolePermission
  // ═════════════════════════════════════════════

  describe('hasRolePermission', () => {
    it('debe retornar true para permisos asignados a un rol', () => {
      expect(hasRolePermission(Role.ADMIN, Permission.MANAGE_ORG)).toBe(true);
      expect(hasRolePermission(Role.IT_MANAGER, Permission.TRIGGER_AI_ANALYSIS)).toBe(true);
      expect(hasRolePermission(Role.READER, Permission.VIEW_DASHBOARD)).toBe(true);
    });

    it('debe retornar false para permisos no asignados a un rol', () => {
      expect(hasRolePermission(Role.READER, Permission.DELETE_SUBSCRIPTION)).toBe(false);
      expect(hasRolePermission(Role.IT_MANAGER, Permission.REMOVE_MEMBER)).toBe(false);
    });

    it('debe retornar false si se pasa un rol no existente', () => {
      expect(hasRolePermission('INVALID_ROLE' as Role, Permission.VIEW_DASHBOARD)).toBe(false);
    });
  });
});
