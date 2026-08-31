import { Request, Response, NextFunction } from 'express';
import { OAuthProvider } from '@prisma/client';
import {
  getGoogleAuthUrl,
  redirectToGoogleAuth,
  handleGoogleCallback,
  refreshGoogleToken,
} from '../google-oauth.controller';
import { googleOAuthService } from '../../services/google-oauth.service';

describe('GoogleOAuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('getGoogleAuthUrl', () => {
    it('debe responder con status 200 y la URL de autorización en JSON', async () => {
      mockRequest.query = { organizationId: 'org-test-1' };

      await getGoogleAuthUrl(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            url: expect.stringContaining('https://accounts.google.com'),
            state: expect.any(String),
          }),
        })
      );
    });

    it('debe capturar errores y llamar a next(error) si el servicio falla', async () => {
      jest.spyOn(googleOAuthService, 'generateAuthorizationUrl').mockImplementationOnce(() => {
        throw new Error('OAuth error simulated');
      });

      await getGoogleAuthUrl(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('redirectToGoogleAuth', () => {
    it('debe ejecutar una redirección HTTP 302 hacia la URL de Google', async () => {
      mockRequest.query = { organizationId: 'org-test-2' };

      await redirectToGoogleAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('https://accounts.google.com')
      );
    });
  });

  describe('handleGoogleCallback', () => {
    it('debe llamar a next(error) si el usuario denegó el consentimiento (error query param)', async () => {
      mockRequest.query = { error: 'access_denied' };

      await handleGoogleCallback(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Autorización cancelada o denegada'),
        })
      );
    });

    it('debe llamar a next(error) si faltan code o state', async () => {
      mockRequest.query = { code: 'code_without_state' };

      await handleGoogleCallback(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Parámetros de código o estado requeridos incompletos'),
        })
      );
    });
  });

  describe('refreshGoogleToken', () => {
    it('debe responder con 200 OK y las credenciales renovadas', async () => {
      mockRequest.body = { organizationId: 'org-refresh-controller' };

      const mockCredential = {
        id: 'cred-123',
        organizationId: 'org-refresh-controller',
        provider: OAuthProvider.GOOGLE_WORKSPACE,

        accessTokenEnc: 'enc_access',
        refreshTokenEnc: 'enc_refresh',
        scope: 'openid',
        tokenType: 'Bearer',
        expiresAt: new Date(),
        isActive: true,
        externalAccountId: 'admin@org.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(googleOAuthService, 'refreshAccessToken').mockResolvedValueOnce(mockCredential);

      await refreshGoogleToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Token de acceso de Google Workspace renovado exitosamente',
          data: expect.objectContaining({
            credentialId: 'cred-123',
            organizationId: 'org-refresh-controller',
            provider: 'GOOGLE_WORKSPACE',
          }),
        })
      );
    });

    it('debe llamar a next(error) si no se especifica organizationId', async () => {
      mockRequest.body = {};
      mockRequest.query = {};

      await refreshGoogleToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Se requiere el ID de la organización'),
        })
      );
    });
  });
});
