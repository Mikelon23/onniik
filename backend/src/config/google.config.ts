/**
 * google.config.ts
 * Configuración centralizada de credenciales y scopes de OAuth 2.0
 * para la integración con Google Cloud Console y Google Workspace en Onniik.
 */

import logger from './logger';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Scopes de OAuth 2.0 requeridos por Onniik para:
 *   1. Autenticación y perfil básico del usuario
 *   2. Lectura del directorio de empleados (Google Workspace Admin Directory API)
 *   3. Lectura de correos de cobro y facturación SaaS (Gmail API)
 */
export const GOOGLE_OAUTH_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];

/**
 * Retorna la configuración OAuth de Google desde variables de entorno.
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/google/callback';

  if (!clientId || clientId.includes('tu-google-client-id')) {
    logger.warn(
      '[GoogleOAuth] ⚠️  ADVERTENCIA: GOOGLE_CLIENT_ID no está configurado correctamente en el archivo .env'
    );
  }

  if (!clientSecret || clientSecret.includes('tu-google-client-secret')) {
    logger.warn(
      '[GoogleOAuth] ⚠️  ADVERTENCIA: GOOGLE_CLIENT_SECRET no está configurado correctamente en el archivo .env'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: GOOGLE_OAUTH_SCOPES,
  };
}

/**
 * Genera la URL de autorización de Google OAuth 2.0 para el flujo Web.
 *
 * @param state Parámetro de estado opcional para prevenir CSRF
 * @returns URL completa para redirigir al usuario al consentimiento de Google
 */
export function getGoogleAuthUrl(state?: string): string {
  const config = getGoogleOAuthConfig();
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline', // Requerido para obtener refresh_token
    prompt: 'consent', // Forzar pantalla de consentimiento para garantizar refresh_token
  });

  if (state) {
    params.append('state', state);
  }

  return `${baseUrl}?${params.toString()}`;
}
