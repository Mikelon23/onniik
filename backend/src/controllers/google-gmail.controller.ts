/**
 * google-gmail.controller.ts
 * Controlador HTTP para gestionar la lectura y detección de correos de cobro SaaS en Gmail API.
 */

import { Request, Response, NextFunction } from 'express';
import { googleGmailService } from '../services/google-gmail.service';
import { BadRequestError } from '../errors/AppError';
import logger from '../config/logger';
import { ActivityLogService } from '../services/activity-log.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    organizationId?: string;
  };
}

/**
 * GET /api/v1/auth/google/gmail/billing-emails
 * Escanea y obtiene la lista de correos electrónicos de cobro de SaaS identificados en Gmail.
 */
export async function getSaaSBillingEmails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const organizationId =
      (req.query.organizationId as string) || (authReq.user?.organizationId as string);

    if (!organizationId) {
      throw new BadRequestError('Se requiere el ID de la organización para escanear Gmail');
    }

    const maxResults = req.query.maxResults ? Number(req.query.maxResults) : undefined;
    const query = req.query.query as string | undefined;

    const billingEmails = await googleGmailService.scanSaaSInvoices(organizationId, {
      maxResults,
      query,
    });

    // Registrar evento de auditoría
    try {
      await ActivityLogService.log({
        organizationId,
        userId: authReq.user?.id || null,
        action: 'INTEGRATION_CONNECTED',
        metadata: {
          provider: 'GOOGLE_WORKSPACE',
          action: 'SCAN_GMAIL_SAAS_INVOICES',
          count: billingEmails.length,
        },
      });
    } catch (logErr) {
      logger.warn('[GoogleGmailController] Error registrando log de auditoría:', logErr);
    }

    res.status(200).json({
      success: true,
      message: 'Correos de cobro SaaS escaneados exitosamente desde Gmail',
      data: {
        billingEmails,
        totalCount: billingEmails.length,
      },
    });
  } catch (error) {
    logger.error('[GoogleGmailController] Error en escaneo de Gmail:', error);
    next(error);
  }
}
