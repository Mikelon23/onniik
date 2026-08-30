/**
 * swagger.test.ts
 * Pruebas unitarias para la especificación y configuración de Swagger API.
 */

import express from 'express';
import { swaggerSpec, setupSwagger } from '../swagger';

describe('Swagger / OpenAPI Configuration', () => {
  it('debe tener una especificación OpenAPI 3.0 válida', () => {
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.info.title).toContain('Onniik API');
    expect(swaggerSpec.info.version).toBe('1.0.0');
  });

  it('debe contener esquemas de seguridad para cookieAuth y bearerAuth', () => {
    const securitySchemes = swaggerSpec.components.securitySchemes;
    expect(securitySchemes).toHaveProperty('cookieAuth');
    expect(securitySchemes).toHaveProperty('bearerAuth');
  });

  it('debe definir las rutas de endpoints principales de v1', () => {
    const paths = swaggerSpec.paths;
    expect(paths).toHaveProperty('/health');
    expect(paths).toHaveProperty('/auth/register');
    expect(paths).toHaveProperty('/auth/login');
    expect(paths).toHaveProperty('/auth/logout');
    expect(paths).toHaveProperty('/auth/me');
    expect(paths).toHaveProperty('/orgs');
    expect(paths).toHaveProperty('/saas/products');
    expect(paths).toHaveProperty('/saas/subscriptions');
    expect(paths).toHaveProperty('/alerts');
    expect(paths).toHaveProperty('/logs');
    expect(paths).toHaveProperty('/dashboard/summary');
  });

  it('debe registrar los endpoints /api/v1/docs/json sin errores en Express', () => {
    const app = express();
    expect(() => setupSwagger(app)).not.toThrow();
  });
});
