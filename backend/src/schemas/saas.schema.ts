import { z } from 'zod';
import { SaaSCategory, BillingCycle, SubscriptionStatus, DetectionSource } from '@prisma/client';

const reqString = (fieldName: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? `El ${fieldName} es requerido.`
          : `El ${fieldName} debe ser texto.`,
    })
    .trim();

// Expresión regular para aceptar tanto fechas simples 'YYYY-MM-DD' como datetimes ISO 8601 completos
const isoDateOrString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}(:?\d{2})?))?$/, {
    error: 'La fecha debe tener un formato válido (YYYY-MM-DD o ISO 8601 completo).',
  });

export const createProductSchema = z.object({
  name: reqString('nombre del producto').min(1, {
    error: 'El nombre del producto no puede estar vacío.',
  }),
  slug: reqString('slug del producto').min(1, {
    error: 'El slug del producto no puede estar vacío.',
  }),
  category: z.nativeEnum(SaaSCategory).optional(),
  description: z.string().trim().optional(),
  website: z
    .string()
    .trim()
    .url({ error: 'El sitio web debe ser una URL válida.' })
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .trim()
    .url({ error: 'El logoUrl debe ser una URL válida.' })
    .optional()
    .or(z.literal('')),
  vendor: z.string().trim().optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se debe proporcionar al menos un campo para actualizar.',
  });

export const createSubscriptionSchema = z.object({
  saasProductId: reqString('saasProductId').uuid({
    error: 'El saasProductId debe ser un UUID válido.',
  }),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  detectionSource: z.nativeEnum(DetectionSource).optional(),
  ownerId: z.string().uuid({ error: 'El ownerId debe ser un UUID válido.' }).nullable().optional(),
  seatCount: z
    .number()
    .int({ error: 'El número de asientos debe ser un entero.' })
    .nonnegative({ error: 'El número de asientos no puede ser negativo.' })
    .nullable()
    .optional(),
  activeSeats: z
    .number()
    .int({ error: 'El número de asientos activos debe ser un entero.' })
    .nonnegative({ error: 'El número de asientos activos no puede ser negativo.' })
    .nullable()
    .optional(),
  costPerSeat: z
    .number()
    .nonnegative({ error: 'El costo por asiento no puede ser negativo.' })
    .nullable()
    .optional(),
  totalMonthlyCost: z
    .number()
    .nonnegative({ error: 'El costo mensual total no puede ser negativo.' })
    .nullable()
    .optional(),
  currency: z.string().trim().min(1, { error: 'La moneda no puede estar vacía.' }).optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  renewalDate: isoDateOrString.nullable().optional(),
  contractStart: isoDateOrString.nullable().optional(),
  contractEnd: isoDateOrString.nullable().optional(),
  externalId: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema
  .omit({ saasProductId: true }) // saasProductId no se puede cambiar después de crear la suscripción
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se debe proporcionar al menos un campo para actualizar.',
  });

export const updateSubscriptionStatusSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus, {
    error: () =>
      `Estado inválido. Valores permitidos: ${Object.values(SubscriptionStatus).join(', ')}`,
  }),
  reason: z.string().trim().optional(),
});
