/**
 * swagger.ts
 * Configuración de Swagger / OpenAPI 3.0 para Onniik API.
 *
 * Expone la documentación interactiva en `/api/v1/docs` y la especificación en JSON en `/api/v1/docs/json`.
 */

import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Onniik API — Platform Documentation',
    version: '1.0.0',
    description:
      'API RESTful para la plataforma Onniik - Congelador de Costos SaaS y Gestión Inteligente de Licencias.',
    contact: {
      name: 'Soporte Técnico Onniik',
      email: 'dev@onniik.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Servidor API v1 (Entorno Principal)',
    },
  ],
  tags: [
    { name: 'Health', description: 'Monitoreo de estado de salud del sistema' },
    {
      name: 'Auth',
      description: 'Autenticación de usuarios, registro, login y gestión de sesión JWT',
    },
    { name: 'Organizations', description: 'Gestión de organizaciones y miembros invitados' },
    {
      name: 'SaaS',
      description: 'Inventario de productos SaaS y suscripciones de la organización',
    },
    { name: 'Alerts', description: 'Alertas de optimización de costos generadas por IA' },
    { name: 'Logs', description: 'Auditoría de actividad y registros del sistema' },
    { name: 'Dashboard', description: 'Métricas consolidadas de gasto y resúmenes analíticos' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Cookie de sesión HttpOnly que contiene el token JWT.',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT enviado en el encabezado Authorization: Bearer <token>.',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Descripción detallada del error' },
        },
      },
      UserPublicProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_123456' },
          email: { type: 'string', example: 'usuario@empresa.com' },
          name: { type: 'string', example: 'Juan Pérez', nullable: true },
          role: { type: 'string', enum: ['ADMIN', 'READER', 'IT_MANAGER'], example: 'ADMIN' },
          organizationId: { type: 'string', example: 'org_789012' },
          organizationName: { type: 'string', example: 'Acme Corp', nullable: true },
        },
      },
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'org_789012' },
          name: { type: 'string', example: 'Acme Corp' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SaaSProduct: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod_123' },
          name: { type: 'string', example: 'Slack' },
          category: { type: 'string', example: 'Comunicación' },
          vendorUrl: { type: 'string', example: 'https://slack.com' },
        },
      },
      SaaSSubscription: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'sub_456' },
          organizationId: { type: 'string', example: 'org_789012' },
          productId: { type: 'string', example: 'prod_123' },
          monthlyCost: { type: 'number', example: 1250.0 },
          seatsCount: { type: 'integer', example: 50 },
          activeSeatsCount: { type: 'integer', example: 35 },
          status: { type: 'string', example: 'ACTIVE' },
        },
      },
      OptimizationAlert: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'alt_789' },
          organizationId: { type: 'string', example: 'org_789012' },
          subscriptionId: { type: 'string', example: 'sub_456' },
          title: { type: 'string', example: '15 licencias inactivas detectadas' },
          potentialMonthlySavings: { type: 'number', example: 375.0 },
          status: { type: 'string', example: 'PENDING' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'log_001' },
          organizationId: { type: 'string', example: 'org_789012' },
          userId: { type: 'string', example: 'usr_123456' },
          action: { type: 'string', example: 'USER_LOGIN' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica la salud del servidor y la conexión a la base de datos y Redis',
        responses: {
          '200': {
            description: 'Sistema operando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string' },
                    uptime: { type: 'number' },
                    services: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de un nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'organizationId'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  organizationId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario registrado exitosamente' },
          '400': { description: 'Datos de entrada inválidos u organización no encontrada' },
          '409': { description: 'El correo electrónico ya se encuentra registrado' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Inicio de sesión de usuario y generación de cookie JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Autenticación exitosa y cookie enviada' },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cierre de sesión e invalidación de token JWT en Redis',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Sesión cerrada exitosamente y token revocado' },
          '401': { description: 'No hay sesión activa o el token fue revocado previamente' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtiene el perfil actualizado del usuario autenticado',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          '200': { description: 'Perfil de usuario obtenido' },
          '401': { description: 'No autorizado' },
        },
      },
    },
    '/orgs': {
      get: {
        tags: ['Organizations'],
        summary: 'Consulta información de la organización del usuario',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Datos de la organización' },
        },
      },
    },
    '/orgs/invite': {
      post: {
        tags: ['Organizations'],
        summary: 'Invita un nuevo miembro a la organización (Requiere ADMIN)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Invitación enviada exitosamente' },
          '403': { description: 'Permisos insuficientes' },
        },
      },
    },
    '/saas/products': {
      get: {
        tags: ['SaaS'],
        summary: 'Lista el catálogo global de productos SaaS',
        responses: {
          '200': { description: 'Lista de productos SaaS' },
        },
      },
    },
    '/saas/subscriptions': {
      get: {
        tags: ['SaaS'],
        summary: 'Lista las suscripciones SaaS de la organización',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Suscripciones activas de la organización' },
        },
      },
    },
    '/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'Obtiene las alertas de optimización de costos generadas',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Lista de alertas' },
        },
      },
    },
    '/logs': {
      get: {
        tags: ['Logs'],
        summary: 'Consulta los registros de auditoría de la organización',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Historial de logs de actividad' },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Obtiene el resumen consolidado de KPIs financieros y de uso',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Métricas resumidas del dashboard' },
        },
      },
    },
  },
};

/**
 * Configura las rutas de documentación de Swagger UI en la aplicación Express.
 *
 * @param app Instancia de la aplicación Express
 */
export function setupSwagger(app: Express): void {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Endpoint de especificación JSON pura para integraciones o herramientas externas
  app.get('/api/v1/docs/json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  logger.info('[Swagger] Documentación API preliminar habilitada en /api/v1/docs y /docs');
}
