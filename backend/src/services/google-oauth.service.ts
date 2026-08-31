/**
 * google-oauth.service.ts
 * Servicio para gestionar el flujo de autorización OAuth2 de Google Workspace en Onniik.
 */

import crypto from 'crypto';
import { OAuthProvider } from '@prisma/client';
import prisma from '../config/db';
import { getGoogleAuthUrl, getGoogleOAuthConfig } from '../config/google.config';
import logger from '../config/logger';
import { encrypt } from '../utils/crypto.utils';
import { BadRequestError } from '../errors/AppError';

export interface OAuthStatePayload {
  organizationId?: string;
  redirectPath?: string;
  timestamp: number;
  nonce: string;
}

export class GoogleOAuthService {
  /**
   * Genera un parámetro `state` seguro para prevenir ataques CSRF
   * y asociar la petición a una organización o ruta específica.
   */
  public generateState(organizationId?: string, redirectPath?: string): string {
    const payload: OAuthStatePayload = {
      organizationId,
      redirectPath,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const jsonStr = JSON.stringify(payload);
    return Buffer.from(jsonStr).toString('base64url');
  }

  /**
   * Decodifica y verifica la validez del parámetro `state`.
   * Expira pasados 60 minutos (3,600,000 ms).
   */
  public verifyState(state: string): { isValid: boolean; payload?: OAuthStatePayload } {
    try {
      if (!state) {
        return { isValid: false };
      }

      const jsonStr = Buffer.from(state, 'base64url').toString('utf8');
      const payload: OAuthStatePayload = JSON.parse(jsonStr);

      if (!payload.timestamp || !payload.nonce) {
        return { isValid: false };
      }

      const maxAgeMs = 60 * 60 * 1000; // 1 hora
      const now = Date.now();
      if (now - payload.timestamp > maxAgeMs) {
        logger.warn('[GoogleOAuthService] ⚠️ Parámetro state expirado');
        return { isValid: false };
      }

      return { isValid: true, payload };
    } catch (error) {
      logger.error('[GoogleOAuthService] Error decodificando parámetro state:', error);
      return { isValid: false };
    }
  }

  /**
   * Genera la URL completa de autorización OAuth 2.0 de Google Workspace.
   *
   * @param organizationId ID opcional de la organización solicitante
   * @param redirectPath Ruta opcional de retorno en el frontend
   * @returns Objeto con la URL generada y el estado asociado
   */
  public generateAuthorizationUrl(
    organizationId?: string,
    redirectPath?: string
  ): { url: string; state: string } {
    const config = getGoogleOAuthConfig();
    const state = this.generateState(organizationId, redirectPath);
    const url = getGoogleAuthUrl(state);

    logger.info('[GoogleOAuthService] URL de autorización OAuth2 de Google generada con éxito', {
      organizationId,
      redirectUri: config.redirectUri,
      scopesCount: config.scopes.length,
    });

    return { url, state };
  }

  /**
   * Intercambia un código de autorización de Google por tokens de acceso y refresco.
   *
   * @param code Código de autorización recibido en el callback
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
    id_token?: string;
  }> {
    const config = getGoogleOAuthConfig();

    const params = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as Record<string, string>;
        logger.error('[GoogleOAuthService] Error intercambiando código por tokens:', errorData);
        throw new BadRequestError(
          `Google OAuth Error: ${errorData.error_description || errorData.error || 'Error al obtener tokens'}`
        );
      }

      const tokenData = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        scope: string;
        token_type: string;
        id_token?: string;
      };
      logger.info('[GoogleOAuthService] Tokens obtenidos de Google exitosamente');

      return tokenData;
    } catch (error: unknown) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      logger.error('[GoogleOAuthService] Error en petición de intercambio de tokens:', error);
      throw new BadRequestError('Fallo la conexión con los servidores de autenticación de Google');
    }
  }

  /**
   * Decodifica de forma segura el `id_token` JWT emitido por Google para obtener información del usuario.
   */
  public decodeIdToken(idToken?: string): { email?: string; sub?: string; name?: string } | null {
    if (!idToken) {
      return null;
    }
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
      return JSON.parse(payloadStr);
    } catch (error) {
      logger.warn('[GoogleOAuthService] No se pudo decodificar el id_token:', error);
      return null;
    }
  }

  /**
   * Guarda o actualiza los tokens cifrados de Google Workspace en la base de datos PostgreSQL.
   */
  public async saveGoogleCredentials(
    organizationId: string,
    tokens: {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope?: string;
      token_type?: string;
    },
    externalAccountId?: string
  ) {
    const accessTokenEnc = encrypt(tokens.access_token);
    const refreshTokenEnc = tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const credential = await prisma.oAuthCredential.upsert({
      where: {
        unique_org_provider: {
          organizationId,
          provider: OAuthProvider.GOOGLE_WORKSPACE,
        },
      },
      update: {
        accessTokenEnc,
        ...(refreshTokenEnc && { refreshTokenEnc }),
        scope: tokens.scope,
        tokenType: tokens.token_type || 'Bearer',
        expiresAt,
        isActive: true,
        ...(externalAccountId && { externalAccountId }),
      },
      create: {
        organizationId,
        provider: OAuthProvider.GOOGLE_WORKSPACE,
        accessTokenEnc,
        refreshTokenEnc,
        scope: tokens.scope,
        tokenType: tokens.token_type || 'Bearer',
        expiresAt,
        isActive: true,
        externalAccountId,
      },
    });

    logger.info('[GoogleOAuthService] Credenciales OAuth de Google guardadas exitosamente', {
      credentialId: credential.id,
      organizationId,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt,
    });

    return credential;
  }
}

export const googleOAuthService = new GoogleOAuthService();
