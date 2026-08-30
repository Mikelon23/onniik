import { googleOAuthService } from '../google-oauth.service';
import { GOOGLE_OAUTH_SCOPES } from '../../config/google.config';

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
});
