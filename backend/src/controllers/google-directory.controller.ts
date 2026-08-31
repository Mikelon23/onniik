/**
 * google-directory.controller.ts
 * Controlador HTTP para gestionar solicitudes a la API de Google Workspace Directory.
 */

import { Request, Response, NextFunction } from 'express';
import { googleDirectoryService } from '../services/google-directory.service';
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
 * GET /api/v1/auth/google/directory/users
 * Obtiene la lista de usuarios y empleados del dominio Google Workspace de la organización.
 */
export async function getDirectoryUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const organizationId =
      (req.query.organizationId as string) || (authReq.user?.organizationId as string);

    if (!organizationId) {
      throw new BadRequestError(
        'Se requiere el ID de la organización para consultar el directorio'
      );
    }

    const fetchAll = req.query.fetchAll === 'true';
    const pageToken = req.query.pageToken as string | undefined;
    const query = req.query.query as string | undefined;
    const maxResults = req.query.maxResults ? Number(req.query.maxResults) : undefined;

    if (fetchAll) {
      const users = await googleDirectoryService.fetchAllDirectoryUsers(organizationId);

      // Registrar auditoría opcional
      try {
        await ActivityLogService.log({
          organizationId,
          userId: authReq.user?.id || null,
          action: 'INTEGRATION_CONNECTED',
          metadata: {
            provider: 'GOOGLE_WORKSPACE',
            action: 'FETCH_ALL_DIRECTORY_USERS',
            count: users.length,
          },
        });
      } catch (logErr) {
        logger.warn('[GoogleDirectoryController] Error registrando log de auditoría:', logErr);
      }

      res.status(200).json({
        success: true,
        message: 'Directorio completo de Google Workspace obtenido exitosamente',
        data: {
          users,
          totalItems: users.length,
        },
      });
      return;
    }

    const result = await googleDirectoryService.fetchDirectoryUsers(organizationId, {
      maxResults,
      pageToken,
      query,
    });

    res.status(200).json({
      success: true,
      message: 'Usuarios de Google Workspace obtenidos exitosamente',
      data: {
        users: result.users,
        nextPageToken: result.nextPageToken,
        totalItems: result.totalItems,
      },
    });
  } catch (error) {
    logger.error('[GoogleDirectoryController] Error al consultar el directorio de Google:', error);
    next(error);
  }
}
