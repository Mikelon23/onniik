import { Request, Response, NextFunction } from 'express';
import { getGoogleAuthUrl, redirectToGoogleAuth } from '../google-oauth.controller';
import { googleOAuthService } from '../../services/google-oauth.service';

describe('GoogleOAuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
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
});
