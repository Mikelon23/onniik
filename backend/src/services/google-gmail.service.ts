/**
 * google-gmail.service.ts
 * Servicio para interactuar con la API de Gmail (gmail.googleapis.com/gmail/v1)
 * para la búsqueda, filtrado y detección de correos electrónicos de cobro y facturación SaaS.
 */

import { googleOAuthService } from './google-oauth.service';
import logger from '../config/logger';
import { BadRequestError } from '../errors/AppError';

export interface SaaSBillingEmail {
  messageId: string;
  threadId: string;
  from: string;
  to?: string;
  subject: string;
  date: string;
  snippet: string;
  vendorCandidate?: string;
}

export interface SearchGmailMessagesOptions {
  maxResults?: number;
  pageToken?: string;
  query?: string;
}

export interface SearchGmailMessagesResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export class GoogleGmailService {
  /**
   * Extrae el nombre candidato del proveedor SaaS desde el campo 'From' o el 'Subject'.
   */
  private extractVendorName(fromHeader: string, subjectHeader: string): string {
    if (!fromHeader) return 'Desconocido';

    // 1. Extraer nombre visible si existe: "GitHub Billing <billing@github.com>" -> "GitHub"
    const matchDisplayName = fromHeader.match(/^"?([^"<]+)"?\s*<.+>/);
    if (matchDisplayName && matchDisplayName[1]) {
      const rawName = matchDisplayName[1].trim();
      const cleanName = rawName
        .replace(/\s+(Billing|Invoices?|Receipts?|Support|Notifications?|Team|Account)$/i, '')
        .trim();

      if (
        cleanName.length > 1 &&
        !['Billing', 'Support', 'No-Reply', 'No Reply', 'Invoice', 'Receipt'].includes(cleanName)
      ) {
        return cleanName;
      }
    }

    // 2. Extraer dominio del email: "billing@atlassian.com" -> "atlassian"
    const matchEmail = fromHeader.match(/<([^>]+)>/) || [null, fromHeader];
    const email = matchEmail[1] || fromHeader;
    const domainMatch = email.match(/@([^.]+)\./);
    if (domainMatch && domainMatch[1]) {
      const domainName = domainMatch[1];
      if (
        !['gmail', 'googlemail', 'yahoo', 'outlook', 'hotmail'].includes(domainName.toLowerCase())
      ) {
        return domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
    }

    // 3. Fallback: buscar palabras clave en el Asunto
    if (subjectHeader) {
      const words = subjectHeader.split(' ');
      if (words.length > 0) return words[0];
    }

    return 'Proveedor SaaS';
  }

  /**
   * Busca mensajes en la cuenta de Gmail conectados según palabras clave de cobros/facturas.
   *
   * @param organizationId ID de la organización
   * @param options Opciones de búsqueda y paginación
   */
  public async searchBillingMessages(
    organizationId: string,
    options?: SearchGmailMessagesOptions
  ): Promise<SearchGmailMessagesResponse> {
    const accessToken = await googleOAuthService.getValidAccessToken(organizationId);

    const defaultQuery =
      'subject:(invoice OR receipt OR factura OR suscripción OR subscription OR payment OR cobro) OR from:(billing OR invoice OR receipts OR support OR no-reply OR no_reply)';

    const searchQuery = options?.query ? options.query : defaultQuery;

    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('maxResults', String(options?.maxResults || 20));

    if (options?.pageToken) {
      url.searchParams.append('pageToken', options.pageToken);
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
          error?: { message?: string };
        };
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        logger.error('[GoogleGmailService] Error en búsqueda de mensajes Gmail:', {
          organizationId,
          status: response.status,
          errorMsg,
        });
        throw new BadRequestError(`Error al consultar mensajes de Gmail: ${errorMsg}`);
      }

      const data = (await response.json()) as {
        messages?: Array<{ id: string; threadId: string }>;
        nextPageToken?: string;
        resultSizeEstimate?: number;
      };

      return {
        messages: data.messages || [],
        nextPageToken: data.nextPageToken,
        resultSizeEstimate: data.resultSizeEstimate || 0,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      logger.error('[GoogleGmailService] Fallo de red consultando Gmail API:', error);
      throw new BadRequestError('Fallo la conexión con la API de Gmail');
    }
  }

  /**
   * Obtiene los metadatos y encabezados clave de un mensaje específico de Gmail.
   *
   * @param organizationId ID de la organización
   * @param messageId ID del mensaje en Gmail
   */
  public async getMessageDetails(
    organizationId: string,
    messageId: string
  ): Promise<SaaSBillingEmail> {
    const accessToken = await googleOAuthService.getValidAccessToken(organizationId);

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=To`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new BadRequestError(`Error al obtener detalles del mensaje de Gmail ${messageId}`);
      }

      const data = (await response.json()) as {
        id: string;
        threadId: string;
        snippet?: string;
        payload?: {
          headers?: Array<{ name: string; value: string }>;
        };
      };

      const headers = data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const subject = getHeader('Subject');
      const date = getHeader('Date');
      const to = getHeader('To');
      const snippet = data.snippet || '';

      const vendorCandidate = this.extractVendorName(from, subject);

      return {
        messageId: data.id,
        threadId: data.threadId,
        from,
        to,
        subject,
        date,
        snippet,
        vendorCandidate,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError) throw error;
      logger.error(`[GoogleGmailService] Error obteniendo mensaje ${messageId}:`, error);
      throw new BadRequestError('Error recuperando metadatos del correo de Gmail');
    }
  }

  /**
   * Escanea y procesa correos electrónicos de facturación SaaS para la organización.
   *
   * @param organizationId ID de la organización
   * @param options Opciones opcionales de límite de resultados
   */
  public async scanSaaSInvoices(
    organizationId: string,
    options?: { maxResults?: number; query?: string }
  ): Promise<SaaSBillingEmail[]> {
    const searchRes = await this.searchBillingMessages(organizationId, {
      maxResults: options?.maxResults || 20,
      query: options?.query,
    });

    if (!searchRes.messages || searchRes.messages.length === 0) {
      logger.info('[GoogleGmailService] No se encontraron mensajes de cobro SaaS', {
        organizationId,
      });
      return [];
    }

    const emailPromises = searchRes.messages.map((m) =>
      this.getMessageDetails(organizationId, m.id).catch((err) => {
        logger.warn(
          `[GoogleGmailService] Omitiendo mensaje ${m.id} por error al consultar metadatos:`,
          err
        );
        return null;
      })
    );

    const results = await Promise.all(emailPromises);
    const validEmails = results.filter((item): item is SaaSBillingEmail => item !== null);

    logger.info('[GoogleGmailService] Escaneo de correos SaaS de Gmail completado exitosamente', {
      organizationId,
      totalScanned: validEmails.length,
    });

    return validEmails;
  }
}

export const googleGmailService = new GoogleGmailService();
