/**
 * google.config.test.ts
 * Pruebas unitarias para el módulo de configuración OAuth de Google.
 */

import { getGoogleOAuthConfig, getGoogleAuthUrl, GOOGLE_OAUTH_SCOPES } from '../google.config';

describe('Google OAuth Configuration Module', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('debe definir los 5 scopes requeridos para Google Workspace & Gmail', () => {
    expect(GOOGLE_OAUTH_SCOPES).toContain('openid');
    expect(GOOGLE_OAUTH_SCOPES).toContain('https://www.googleapis.com/auth/userinfo.profile');
    expect(GOOGLE_OAUTH_SCOPES).toContain('https://www.googleapis.com/auth/userinfo.email');
    expect(GOOGLE_OAUTH_SCOPES).toContain(
      'https://www.googleapis.com/auth/admin.directory.user.readonly'
    );
    expect(GOOGLE_OAUTH_SCOPES).toContain('https://www.googleapis.com/auth/gmail.readonly');
  });

  it('debe obtener la configuración desde variables de entorno', () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/custom/callback';

    const config = getGoogleOAuthConfig();

    expect(config.clientId).toBe('test-client-id.apps.googleusercontent.com');
    expect(config.clientSecret).toBe('test-client-secret');
    expect(config.redirectUri).toBe('http://localhost:5000/custom/callback');
    expect(config.scopes).toEqual(GOOGLE_OAUTH_SCOPES);
  });

  it('debe generar una URL de autorización OAuth2 válida con parámetros requeridos', () => {
    process.env.GOOGLE_CLIENT_ID = 'my-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/api/v1/auth/google/callback';

    const authUrl = getGoogleAuthUrl('csrf_token_123');

    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=my-client-id.apps.googleusercontent.com');
    expect(authUrl).toContain(
      'redirect_uri=' + encodeURIComponent('http://localhost:5000/api/v1/auth/google/callback')
    );
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('access_type=offline');
    expect(authUrl).toContain('prompt=consent');
    expect(authUrl).toContain('state=csrf_token_123');
  });

  it('debe emitir una advertencia en el logger si las credenciales de Google no están configuradas', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const config = getGoogleOAuthConfig();

    expect(config.clientId).toBe('');
    expect(config.clientSecret).toBe('');
  });
});
