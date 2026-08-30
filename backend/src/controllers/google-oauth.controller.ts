/**
 * google-oauth.controller.ts
 * Controlador para gestionar las solicitudes HTTP del flujo OAuth2 de Google Workspace.
 */

import { Request, Response, NextFunction } from 'express';
import { googleOAuthService } from '../services/google-oauth.service';
import logger from '../config/logger';

interface AuthenticatedRequest extends Request {
  user?: {
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
