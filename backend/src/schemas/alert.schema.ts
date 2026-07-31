import { z } from 'zod';
import { AlertType, AlertPriority } from '@prisma/client';

const reqString = (fieldName: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? `El ${fieldName} es requerido.`
          : `El ${fieldName} debe ser texto.`,
    })
    .trim();

const isoDateOrString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}(:?\d{2})?))?$/, {
    error: 'La fecha debe tener un formato válido (YYYY-MM-DD o ISO 8601 completo).',
  });

export const createAlertSchema = z.object({
  subscriptionId: z
    .string()
    .uuid({ error: 'El subscriptionId debe ser un UUID válido.' })
    .nullable()
    .optional(),
  triggeredByUserId: z
    .string()
    .uuid({ error: 'El triggeredByUserId debe ser un UUID válido.' })
    .nullable()
    .optional(),
  alertType: z.nativeEnum(AlertType, {
    error: () =>
      `Tipo de alerta inválido. Valores permitidos: ${Object.values(AlertType).join(', ')}`,
  }),
  priority: z
    .nativeEnum(AlertPriority, {
      error: () =>
        `Prioridad inválida. Valores permitidos: ${Object.values(AlertPriority).join(', ')}`,
    })
    .optional(),
  title: reqString('título').min(1, { error: 'El título de la alerta no puede estar vacío.' }),
  description: reqString('descripción').min(1, {
    error: 'La descripción de la alerta no puede estar vacía.',
  }),
  recommendation: reqString('recomendación').min(1, {
    error: 'La recomendación de la alerta no puede estar vacía.',
  }),
  estimatedSavings: z
    .number()
    .nonnegative({ error: 'El ahorro estimado no puede ser negativo.' })
    .optional(),
  currency: z.string().trim().optional(),
  aiModelVersion: z.string().trim().optional(),
  confidenceScore: z
    .number()
    .min(0, { error: 'La puntuación de confianza no puede ser menor a 0.' })
    .max(1, { error: 'La puntuación de confianza no puede ser mayor a 1.' })
    .optional(),
  aiRawResponse: z.string().optional(),
  expiresAt: isoDateOrString.nullable().optional(),
});

export const resolveAlertSchema = z.object({
  status: z.enum(['ACCEPTED', 'DISMISSED', 'COMPLETED'], {
    error: () =>
      'Estado de resolución inválido. Estados permitidos: ACCEPTED, DISMISSED, COMPLETED',
  }),
  resolutionNote: z.string().trim().optional(),
});
