import { googleGmailService } from '../google-gmail.service';
import { googleOAuthService } from '../google-oauth.service';
import { BadRequestError } from '../../errors/AppError';

describe('GoogleGmailService', () => {
  const mockOrgId = 'org-gmail-test';
  const mockAccessToken = 'ya29.mock_valid_gmail_token';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(googleOAuthService, 'getValidAccessToken').mockResolvedValue(mockAccessToken);
  });

  describe('searchBillingMessages', () => {
    it('debe buscar mensajes de cobro en Gmail API y retornar los IDs', async () => {
      const mockSearchResponse = {
        messages: [
          { id: 'msg-101', threadId: 'thread-1' },
          { id: 'msg-102', threadId: 'thread-2' },
        ],
        nextPageToken: 'gmail_page_2',
        resultSizeEstimate: 2,
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
      } as unknown as Response);

      const result = await googleGmailService.searchBillingMessages(mockOrgId, { maxResults: 10 });

      expect(googleOAuthService.getValidAccessToken).toHaveBeenCalledWith(mockOrgId);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://gmail.googleapis.com/gmail/v1/users/me/messages'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result.messages).toHaveLength(2);
      expect(result.nextPageToken).toBe('gmail_page_2');
      expect(result.resultSizeEstimate).toBe(2);
    });

    it('debe lanzar BadRequestError si Gmail API responde con error HTTP', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Invalid query' } }),
      } as unknown as Response);

      await expect(googleGmailService.searchBillingMessages(mockOrgId)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('getMessageDetails', () => {
    it('debe obtener y formatear los metadatos de un mensaje de Gmail', async () => {
      const mockMessageDetail = {
        id: 'msg-101',
        threadId: 'thread-1',
        snippet: 'Tu factura mensual de GitHub Team por $21.00 USD ya está disponible.',
        payload: {
          headers: [
            { name: 'From', value: 'GitHub Billing <billing@github.com>' },
            { name: 'Subject', value: 'Receipt for your GitHub subscription' },
            { name: 'Date', value: 'Mon, 25 Aug 2026 14:00:00 GMT' },
            { name: 'To', value: 'admin@empresa.com' },
          ],
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessageDetail,
      } as unknown as Response);

      const emailDetail = await googleGmailService.getMessageDetails(mockOrgId, 'msg-101');

      expect(emailDetail.messageId).toBe('msg-101');
      expect(emailDetail.from).toBe('GitHub Billing <billing@github.com>');
      expect(emailDetail.subject).toBe('Receipt for your GitHub subscription');
      expect(emailDetail.vendorCandidate).toBe('GitHub');
      expect(emailDetail.snippet).toContain('Tu factura mensual de GitHub');
    });
  });

  describe('scanSaaSInvoices', () => {
    it('debe buscar mensajes y consolidar los detalles de todos los correos de cobro', async () => {
      jest.spyOn(googleGmailService, 'searchBillingMessages').mockResolvedValueOnce({
        messages: [{ id: 'msg-1', threadId: 't-1' }],
        resultSizeEstimate: 1,
      });

      jest.spyOn(googleGmailService, 'getMessageDetails').mockResolvedValueOnce({
        messageId: 'msg-1',
        threadId: 't-1',
        from: 'Slack Billing <feedback@slack.com>',
        subject: 'Factura de tu plan Pro de Slack',
        date: '2026-08-01',
        snippet: 'Gracias por usar Slack.',
        vendorCandidate: 'Slack',
      });

      const invoices = await googleGmailService.scanSaaSInvoices(mockOrgId);

      expect(invoices).toHaveLength(1);
      expect(invoices[0].vendorCandidate).toBe('Slack');
      expect(invoices[0].subject).toBe('Factura de tu plan Pro de Slack');
    });
  });
});
