import { Request, Response, NextFunction } from 'express';
import { getSaaSBillingEmails } from '../google-gmail.controller';
import { googleGmailService } from '../../services/google-gmail.service';

describe('GoogleGmailController', () => {
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

  describe('getSaaSBillingEmails', () => {
    it('debe retornar status 200 y los correos de cobro de SaaS escaneados de Gmail', async () => {
      mockRequest.query = { organizationId: 'org-gmail-ctrl-1' };

      const mockInvoices = [
        {
          messageId: 'msg-ctrl-1',
          threadId: 't-ctrl-1',
          from: 'AWS Billing <no-reply-aws@amazon.com>',
          subject: 'Amazon Web Services Invoice [12345]',
          date: 'Mon, 25 Aug 2026 10:00:00 GMT',
          snippet: 'Your AWS billing statement is available.',
          vendorCandidate: 'Amazon',
        },
      ];

      jest.spyOn(googleGmailService, 'scanSaaSInvoices').mockResolvedValueOnce(mockInvoices);

      await getSaaSBillingEmails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(googleGmailService.scanSaaSInvoices).toHaveBeenCalledWith('org-gmail-ctrl-1', {
        maxResults: undefined,
        query: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            billingEmails: mockInvoices,
            totalCount: 1,
          }),
        })
      );
    });

    it('debe llamar a next(error) si falta el ID de la organización', async () => {
      mockRequest.query = {};

      await getSaaSBillingEmails(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Se requiere el ID de la organización'),
        })
      );
    });
  });
});
