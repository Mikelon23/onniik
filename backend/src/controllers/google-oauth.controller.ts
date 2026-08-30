/**
 * google-oauth.controller.ts
 * Controlador para gestionar las solicitudes HTTP del flujo OAuth2 de Google Workspace.
 */

import { Request, Response, NextFunction } from 'express';
import { googleOAuthService } from '../services/google-oauth.service';
import logger from '../config/logger';
import { BadRequestError } from '../errors/AppError';
import { ActivityLogService } from '../services/activity-log.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    organizationId?: string;
  };
}

/**
 * GET /api/v1/auth/google/url
 * Retorna la URL de autorización de Google OAuth 2.0 en formato JSON.
 */
export async function getGoogleAuthUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const organizationId =
      (req.query.organizationId as string) || (authReq.user?.organizationId as string);
    const redirectPath = req.query.redirectPath as string;

    const { url, state } = googleOAuthService.generateAuthorizationUrl(
      organizationId,
      redirectPath
    );

    res.status(200).json({
      success: true,
      data: {
        url,
        state,
      },
    });
  } catch (error) {
    logger.error('[GoogleOAuthController] Error al obtener URL de autorización:', error);
    next(error);
  }
}

/**
 * GET /api/v1/auth/google
 * Redirige directamente al usuario a la pantalla de consentimiento de Google OAuth 2.0 (HTTP 302).
 */
export async function redirectToGoogleAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const organizationId =
      (req.query.organizationId as string) || (authReq.user?.organizationId as string);
    const redirectPath = req.query.redirectPath as string;

    const { url } = googleOAuthService.generateAuthorizationUrl(organizationId, redirectPath);

    logger.info('[GoogleOAuthController] Redirigiendo cliente a Google OAuth2 consent screen');
    res.redirect(url);
  } catch (error) {
    logger.error('[GoogleOAuthController] Error al redirigir a Google OAuth2:', error);
    next(error);
  }
}

/**
 * GET /api/v1/auth/google/callback
 * Recibe el código de autorización de Google, valida el parámetro state,
 * intercambia el código por tokens y guarda la credencial cifrada en PostgreSQL.
 */
export async function handleGoogleCallback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code, state, error } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };

    if (error) {
      logger.warn(
        '[GoogleOAuthController] Consentimiento denegado o cancelado por el usuario:',
        error
      );
      throw new BadRequestError(`Autorización cancelada o denegada: ${error}`);
    }

    if (!code || !state) {
      throw new BadRequestError('Parámetros de código o estado requeridos incompletos');
    }

    const { isValid, payload } = googleOAuthService.verifyState(state);
    if (!isValid || !payload) {
      throw new BadRequestError('El parámetro state de seguridad es inválido o ha expirado');
    }

    const authReq = req as AuthenticatedRequest;
    const organizationId = payload.organizationId || authReq.user?.organizationId;

    if (!organizationId) {
      throw new BadRequestError(
        'No se pudo determinar la organización asociada para guardar las credenciales'
      );
    }

    // Intercambiar código por tokens
    const tokens = await googleOAuthService.exchangeCodeForTokens(code);

    // Decodificar id_token para obtener el correo o ID de cuenta de Google
    const userInfo = googleOAuthService.decodeIdToken(tokens.id_token);
    const externalAccountId = userInfo?.email || userInfo?.sub;

    // Guardar credenciales cifradas en PostgreSQL
    const credential = await googleOAuthService.saveGoogleCredentials(
      organizationId,
      tokens,
      externalAccountId
    );

    // Registrar actividad en ActivityLog
    try {
      await ActivityLogService.log({
        organizationId,
        userId: authReq.user?.id || null,
        action: 'INTEGRATION_CONNECTED',
        metadata: {
          provider: 'GOOGLE_WORKSPACE',
          externalAccountId,
          scope: tokens.scope,
        },
      });
    } catch (logError) {
      logger.warn('[GoogleOAuthController] No se pudo registrar el log de actividad:', logError);
    }

    logger.info('[GoogleOAuthController] Integración de Google Workspace conectada con éxito', {
      organizationId,
      externalAccountId,
    });

    if (payload.redirectPath) {
      res.redirect(payload.redirectPath);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Google Workspace conectado exitosamente',
      data: {
        credentialId: credential.id,
        organizationId,
        provider: credential.provider,
        expiresAt: credential.expiresAt,
        externalAccountId: credential.externalAccountId,
      },
    });
  } catch (error) {
    logger.error('[GoogleOAuthController] Error en callback de Google OAuth2:', error);
    next(error);
  }
}
