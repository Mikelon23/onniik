import { OAuthCredential, OAuthProvider } from '@prisma/client';
import { googleOAuthService } from '../google-oauth.service';
import prisma from '../../config/db';
import { encrypt } from '../../utils/crypto.utils';

describe('GoogleOAuthService', () => {
  describe('generateState', () => {
    it('debe generar una cadena base64url válida', () => {
      const state = googleOAuthService.generateState('org-123', '/dashboard');
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    it('debe decodificar y recuperar los datos proporcionados', () => {
      const orgId = 'org-456';
      const path = '/settings';
      const state = googleOAuthService.generateState(orgId, path);

      const verification = googleOAuthService.verifyState(state);
      expect(verification.isValid).toBe(true);
      expect(verification.payload?.organizationId).toBe(orgId);
      expect(verification.payload?.redirectPath).toBe(path);
      expect(verification.payload?.nonce).toBeDefined();
    });
  });

  describe('verifyState', () => {
    it('debe retornar isValid: false para una cadena vacía o nula', () => {
      expect(googleOAuthService.verifyState('').isValid).toBe(false);
    });

    it('debe retornar isValid: false para una cadena base64 inválida', () => {
      expect(googleOAuthService.verifyState('invalid-state-string').isValid).toBe(false);
    });

    it('debe retornar isValid: false si el estado expiró', () => {
      const expiredPayload = {
        organizationId: 'org-old',
        timestamp: Date.now() - 3600000 * 2, // 2 horas atrás
        nonce: 'abc',
      };
      const expiredState = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');

      const verification = googleOAuthService.verifyState(expiredState);
      expect(verification.isValid).toBe(false);
    });
  });

  describe('generateAuthorizationUrl', () => {
    it('debe construir una URL completa con los parámetros requeridos de Google', () => {
      const { url, state } = googleOAuthService.generateAuthorizationUrl('org-789');

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid');
      expect(url).toContain('gmail.readonly');
      expect(url).toContain(`state=${state}`);
    });
  });

  describe('decodeIdToken', () => {
    it('debe retornar null si no se provee un token', () => {
      expect(googleOAuthService.decodeIdToken('')).toBeNull();
      expect(googleOAuthService.decodeIdToken(undefined)).toBeNull();
    });

    it('debe decodificar un id_token JWT estructurado correctamente', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ email: 'admin@empresa.com', sub: 'google-sub-123' })
      ).toString('base64url');
      const mockIdToken = `${header}.${payload}.signature_hash`;

      const decoded = googleOAuthService.decodeIdToken(mockIdToken);
      expect(decoded).toEqual({
        email: 'admin@empresa.com',
        sub: 'google-sub-123',
      });
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('debe realizar un POST a Google y retornar los tokens decodificados', async () => {
      const mockTokenResponse = {
        access_token: 'ya29.sample_access_token',
        refresh_token: '1//sample_refresh_token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as unknown as Response);

      const result = await googleOAuthService.exchangeCodeForTokens('mock_auth_code');

      expect(fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockTokenResponse);
    });
  });

  describe('refreshAccessToken', () => {
    const mockOrgId = 'org-refresh-123';

    it('debe lanzar BadRequestError si la organización no tiene credenciales o refresh token', async () => {
      jest.spyOn(prisma.oAuthCredential, 'findUnique').mockResolvedValueOnce(null);

      await expect(googleOAuthService.refreshAccessToken(mockOrgId)).rejects.toThrow(
        'No existe una credencial OAuth con token de refresco para esta organización'
      );
    });

    it('debe solicitar un nuevo token a Google y actualizar las credenciales en la base de datos', async () => {
      const encryptedRefreshToken = encrypt('valid_refresh_token');
      const mockCredential: OAuthCredential = {
        id: 'cred-1',
        organizationId: mockOrgId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc: encrypt('old_access_token'),
        refreshTokenEnc: encryptedRefreshToken,
        scope: 'openid email',
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() - 1000), // Expirado
        isActive: true,
        externalAccountId: 'user@domain.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.oAuthCredential, 'findUnique').mockResolvedValueOnce(mockCredential);

      const mockRefreshResponse = {
        access_token: 'ya29.new_refreshed_access_token',
        expires_in: 3600,
        scope: 'openid email',
        token_type: 'Bearer',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      } as unknown as Response);

      const updatedMockCred: OAuthCredential = {
        ...mockCredential,
        accessTokenEnc: encrypt('ya29.new_refreshed_access_token'),
        expiresAt: new Date(Date.now() + 3600000),
      };

      jest.spyOn(prisma.oAuthCredential, 'update').mockResolvedValueOnce(updatedMockCred);

      const result = await googleOAuthService.refreshAccessToken(mockOrgId);

      expect(fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(prisma.oAuthCredential.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cred-1' },
          data: expect.objectContaining({
            isActive: true,
          }),
        })
      );
      expect(result).toBeDefined();
    });

    it('debe desactivar la credencial (isActive: false) si Google responde con invalid_grant', async () => {
      const mockCredential: OAuthCredential = {
        id: 'cred-revoked',
        organizationId: mockOrgId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc: encrypt('old_access_token'),
        refreshTokenEnc: encrypt('revoked_refresh_token'),
        scope: null,
        tokenType: 'Bearer',
        expiresAt: new Date(),
        isActive: true,
        externalAccountId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.oAuthCredential, 'findUnique').mockResolvedValueOnce(mockCredential);

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked',
        }),
      } as unknown as Response);

      jest.spyOn(prisma.oAuthCredential, 'update').mockResolvedValueOnce({
        ...mockCredential,
        isActive: false,
      });

      await expect(googleOAuthService.refreshAccessToken(mockOrgId)).rejects.toThrow(
        'El token de refresco de Google ha caducado o ha sido revocado. Se requiere volver a autenticar.'
      );

      expect(prisma.oAuthCredential.update).toHaveBeenCalledWith({
        where: { id: 'cred-revoked' },
        data: { isActive: false },
      });
    });
  });

  describe('getValidAccessToken', () => {
    const mockOrgId = 'org-valid-token';

    it('debe devolver el access_token actual descifrado si aún no vence y falta más de 5 minutos', async () => {
      const rawToken = 'ya29.current_valid_token';
      const mockCredential: OAuthCredential = {
        id: 'cred-valid',
        organizationId: mockOrgId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc: encrypt(rawToken),
        refreshTokenEnc: encrypt('refresh_token'),
        scope: null,
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // Vence en 20 min
        isActive: true,
        externalAccountId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.oAuthCredential, 'findUnique').mockResolvedValueOnce(mockCredential);

      const token = await googleOAuthService.getValidAccessToken(mockOrgId);
      expect(token).toBe(rawToken);
    });

    it('debe ejecutar refresco automático si el token vence en menos de 5 minutos', async () => {
      const mockCredential: OAuthCredential = {
        id: 'cred-expiring-soon',
        organizationId: mockOrgId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc: encrypt('old_token'),
        refreshTokenEnc: encrypt('refresh_token'),
        scope: null,
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // Vence en 2 min (< 5 min)
        isActive: true,
        externalAccountId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.oAuthCredential, 'findUnique').mockResolvedValueOnce(mockCredential);

      const newTokenRaw = 'ya29.automatically_refreshed_token';
      jest.spyOn(googleOAuthService, 'refreshAccessToken').mockResolvedValueOnce({
        id: 'cred-expiring-soon',
        organizationId: mockOrgId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc: encrypt(newTokenRaw),
        refreshTokenEnc: encrypt('refresh_token'),
        scope: null,
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true,
        externalAccountId: 'user@domain.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const token = await googleOAuthService.getValidAccessToken(mockOrgId);
      expect(googleOAuthService.refreshAccessToken).toHaveBeenCalledWith(mockOrgId);
      expect(token).toBe(newTokenRaw);
    });
  });
});
