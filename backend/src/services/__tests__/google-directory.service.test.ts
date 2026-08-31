import { googleDirectoryService } from '../google-directory.service';
import { googleOAuthService } from '../google-oauth.service';
import { ForbiddenError, BadRequestError } from '../../errors/AppError';

describe('GoogleDirectoryService', () => {
  const mockOrgId = 'org-directory-test';
  const mockAccessToken = 'ya29.mock_valid_directory_token';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(googleOAuthService, 'getValidAccessToken').mockResolvedValue(mockAccessToken);
  });

  describe('fetchDirectoryUsers', () => {
    it('debe obtener y formatear la lista de usuarios del directorio de Google Workspace', async () => {
      const mockGoogleApiResponse = {
        users: [
          {
            id: 'google-usr-1',
            primaryEmail: 'juan.perez@empresa.com',
            name: { givenName: 'Juan', familyName: 'Pérez', fullName: 'Juan Pérez' },
            isAdmin: true,
            isDelegatedAdmin: false,
            suspended: false,
            orgUnitPath: '/IT',
            creationTime: '2026-01-15T10:00:00Z',
            lastLoginTime: '2026-08-30T15:30:00Z',
          },
          {
            id: 'google-usr-2',
            primaryEmail: 'maria.gomez@empresa.com',
            name: { givenName: 'María', familyName: 'Gómez', fullName: 'María Gómez' },
            isAdmin: false,
            isDelegatedAdmin: false,
            suspended: true,
            orgUnitPath: '/Ventas',
          },
        ],
        nextPageToken: 'token_page_2',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoogleApiResponse,
      } as unknown as Response);

      const result = await googleDirectoryService.fetchDirectoryUsers(mockOrgId, {
        maxResults: 50,
      });

      expect(googleOAuthService.getValidAccessToken).toHaveBeenCalledWith(mockOrgId);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://admin.googleapis.com/admin/directory/v1/users'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toEqual({
        id: 'google-usr-1',
        primaryEmail: 'juan.perez@empresa.com',
        name: { givenName: 'Juan', familyName: 'Pérez', fullName: 'Juan Pérez' },
        isAdmin: true,
        isDelegatedAdmin: false,
        isSuspended: false,
        orgUnitPath: '/IT',
        creationTime: '2026-01-15T10:00:00Z',
        lastLoginTime: '2026-08-30T15:30:00Z',
        thumbnailPhotoUrl: undefined,
      });
      expect(result.nextPageToken).toBe('token_page_2');
      expect(result.totalItems).toBe(2);
    });

    it('debe lanzar ForbiddenError si Google responde con HTTP 403 (permisos insuficientes)', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: { message: 'Not Authorized to access this domain' },
        }),
      } as unknown as Response);

      await expect(googleDirectoryService.fetchDirectoryUsers(mockOrgId)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('debe lanzar BadRequestError si ocurre un error HTTP 400 de Google', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: 'Invalid customer id' },
        }),
      } as unknown as Response);

      await expect(googleDirectoryService.fetchDirectoryUsers(mockOrgId)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('fetchAllDirectoryUsers', () => {
    it('debe iterar sobre todas las páginas y consolidar todos los usuarios del dominio', async () => {
      const page1Response = {
        users: [{ id: 'u1', primaryEmail: 'u1@domain.com', name: { fullName: 'User 1' } }],
        nextPageToken: 'page2_token',
      };
      const page2Response = {
        users: [{ id: 'u2', primaryEmail: 'u2@domain.com', name: { fullName: 'User 2' } }],
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        } as unknown as Response);

      const allUsers = await googleDirectoryService.fetchAllDirectoryUsers(mockOrgId);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(allUsers).toHaveLength(2);
      expect(allUsers[0].primaryEmail).toBe('u1@domain.com');
      expect(allUsers[1].primaryEmail).toBe('u2@domain.com');
    });
  });
});
