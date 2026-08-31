/**
 * google-directory.service.ts
 * Servicio para consumir la API de Google Admin Directory (admin.googleapis.com/admin/directory/v1/users)
 * y consultar la lista de usuarios, administradores y empleados de la organización en Google Workspace.
 */

import { googleOAuthService } from './google-oauth.service';
import logger from '../config/logger';
import { BadRequestError, ForbiddenError } from '../errors/AppError';

export interface GoogleDirectoryUser {
  id: string;
  primaryEmail: string;
  name: {
    givenName?: string;
    familyName?: string;
    fullName?: string;
  };
  isAdmin: boolean;
  isDelegatedAdmin: boolean;
  isSuspended: boolean;
  orgUnitPath: string;
  creationTime?: string;
  lastLoginTime?: string;
  thumbnailPhotoUrl?: string;
}

export interface FetchDirectoryUsersOptions {
  maxResults?: number;
  pageToken?: string;
  query?: string;
}

export interface FetchDirectoryUsersResponse {
  users: GoogleDirectoryUser[];
  nextPageToken?: string;
  totalItems: number;
}

export class GoogleDirectoryService {
  /**
   * Consulta una página de usuarios del directorio de Google Workspace para la organización especificada.
   *
   * @param organizationId ID de la organización en Onniik
   * @param options Parámetros opcionales de paginación (maxResults, pageToken) y filtros (query)
   */
  public async fetchDirectoryUsers(
    organizationId: string,
    options?: FetchDirectoryUsersOptions
  ): Promise<FetchDirectoryUsersResponse> {
    const accessToken = await googleOAuthService.getValidAccessToken(organizationId);

    const url = new URL('https://admin.googleapis.com/admin/directory/v1/users');
    url.searchParams.append('customer', 'my_customer');
    url.searchParams.append('projection', 'full');
    url.searchParams.append('maxResults', String(options?.maxResults || 500));

    if (options?.pageToken) {
      url.searchParams.append('pageToken', options.pageToken);
    }
    if (options?.query) {
      url.searchParams.append('query', options.query);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: { message?: string; code?: number; errors?: Array<{ reason?: string }> };
        };

        const errorMsg = errorData.error?.message || `Google API HTTP Error ${response.status}`;

        logger.error('[GoogleDirectoryService] Error al consultar Google Directory API:', {
          organizationId,
          status: response.status,
          errorData,
        });

        if (response.status === 403) {
          throw new ForbiddenError(
            `Permisos insuficientes en Google Workspace: ${errorMsg}. Verifique que la cuenta conectada sea Administrador del dominio y que la API de Admin SDK esté habilitada.`
          );
        }

        throw new BadRequestError(`Error al consultar directorio de Google: ${errorMsg}`);
      }

      const data = (await response.json()) as {
        users?: Array<{
          id: string;
          primaryEmail: string;
          name?: { givenName?: string; familyName?: string; fullName?: string };
          isAdmin?: boolean;
          isDelegatedAdmin?: boolean;
          suspended?: boolean;
          orgUnitPath?: string;
          creationTime?: string;
          lastLoginTime?: string;
          thumbnailPhotoUrl?: string;
        }>;
        nextPageToken?: string;
      };

      const users: GoogleDirectoryUser[] = (data.users || []).map((u) => ({
        id: u.id,
        primaryEmail: u.primaryEmail,
        name: {
          givenName: u.name?.givenName,
          familyName: u.name?.familyName,
          fullName: u.name?.fullName,
        },
        isAdmin: Boolean(u.isAdmin),
        isDelegatedAdmin: Boolean(u.isDelegatedAdmin),
        isSuspended: Boolean(u.suspended),
        orgUnitPath: u.orgUnitPath || '/',
        creationTime: u.creationTime,
        lastLoginTime: u.lastLoginTime,
        thumbnailPhotoUrl: u.thumbnailPhotoUrl,
      }));

      logger.info(
        '[GoogleDirectoryService] Usuarios de Google Directory consultados exitosamente',
        {
          organizationId,
          count: users.length,
          hasNextPage: Boolean(data.nextPageToken),
        }
      );

      return {
        users,
        nextPageToken: data.nextPageToken,
        totalItems: users.length,
      };
    } catch (error: unknown) {
      if (error instanceof ForbiddenError || error instanceof BadRequestError) {
        throw error;
      }
      logger.error('[GoogleDirectoryService] Error de red consultando Google Directory:', error);
      throw new BadRequestError('Fallo la conexión con la API de Google Admin Directory');
    }
  }

  /**
   * Recorre iterativamente la API de Google Directory para obtener la totalidad
   * de usuarios del dominio de Google Workspace de la organización.
   *
   * @param organizationId ID de la organización
   */
  public async fetchAllDirectoryUsers(organizationId: string): Promise<GoogleDirectoryUser[]> {
    const allUsers: GoogleDirectoryUser[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const pageResult = await this.fetchDirectoryUsers(organizationId, {
        pageToken,
        maxResults: 500,
      });
      allUsers.push(...pageResult.users);
      pageToken = pageResult.nextPageToken;
    } while (pageToken);

    logger.info(
      `[GoogleDirectoryService] Sincronización completa de Google Directory finalizada. Total usuarios: ${allUsers.length}`,
      { organizationId }
    );

    return allUsers;
  }
}

export const googleDirectoryService = new GoogleDirectoryService();
