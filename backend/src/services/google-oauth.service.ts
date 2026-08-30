/**
 * google-oauth.service.ts
 * Servicio para gestionar el flujo de autorización OAuth2 de Google Workspace en Onniik.
 */

import crypto from 'crypto';
import { getGoogleAuthUrl, getGoogleOAuthConfig } from '../config/google.config';
import logger from '../config/logger';

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
}

export const googleOAuthService = new GoogleOAuthService();
