import { Request, Response, NextFunction } from 'express';
import { getDirectoryUsers } from '../google-directory.controller';
import { googleDirectoryService } from '../../services/google-directory.service';

describe('GoogleDirectoryController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('getDirectoryUsers', () => {
    it('debe retornar status 200 y los usuarios del directorio paginados', async () => {
      mockRequest.query = { organizationId: 'org-dir-ctrl-1' };

      const mockUsers = [
        {
          id: 'g-1',
          primaryEmail: 'user1@domain.com',
          name: { fullName: 'User One' },
          isAdmin: false,
          isDelegatedAdmin: false,
          isSuspended: false,
          orgUnitPath: '/',
        },
      ];

      jest.spyOn(googleDirectoryService, 'fetchDirectoryUsers').mockResolvedValueOnce({
        users: mockUsers,
        nextPageToken: 'next_page',
        totalItems: 1,
      });

      await getDirectoryUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(googleDirectoryService.fetchDirectoryUsers).toHaveBeenCalledWith('org-dir-ctrl-1', {
        maxResults: undefined,
        pageToken: undefined,
        query: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: mockUsers,
            nextPageToken: 'next_page',
            totalItems: 1,
          }),
        })
      );
    });

    it('debe obtener todos los usuarios si fetchAll=true en la consulta', async () => {
      mockRequest.query = { organizationId: 'org-dir-ctrl-2', fetchAll: 'true' };

      const mockAllUsers = [
        {
          id: 'g-1',
          primaryEmail: 'user1@domain.com',
          name: { fullName: 'User One' },
          isAdmin: false,
          isDelegatedAdmin: false,
          isSuspended: false,
          orgUnitPath: '/',
        },
        {
          id: 'g-2',
          primaryEmail: 'user2@domain.com',
          name: { fullName: 'User Two' },
          isAdmin: true,
          isDelegatedAdmin: false,
          isSuspended: false,
          orgUnitPath: '/Admin',
        },
      ];

      jest
        .spyOn(googleDirectoryService, 'fetchAllDirectoryUsers')
        .mockResolvedValueOnce(mockAllUsers);

      await getDirectoryUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(googleDirectoryService.fetchAllDirectoryUsers).toHaveBeenCalledWith('org-dir-ctrl-2');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: mockAllUsers,
            totalItems: 2,
          }),
        })
      );
    });

    it('debe llamar a next(error) si no se especifica el ID de la organización', async () => {
      mockRequest.query = {};

      await getDirectoryUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Se requiere el ID de la organización'),
        })
      );
    });
  });
});
