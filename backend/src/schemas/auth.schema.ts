import { z } from 'zod';

const reqString = (fieldName: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? `El ${fieldName} es requerido.`
          : `El ${fieldName} debe ser texto.`,
    })
    .trim();

export const registerSchema = z.object({
  email: reqString('email')
    .email({ error: 'El formato del email proporcionado no es válido.' })
    .toLowerCase(),
  password: reqString('contraseña')
    .min(8, { error: 'La contraseña debe tener al menos 8 caracteres.' })
    .refine((val) => /[a-zA-Z]/.test(val) && /\d/.test(val), {
      message: 'La contraseña debe incluir al menos una letra y un número.',
    }),
  name: z.string().trim().optional(),
  organizationId: reqString('organizationId').uuid({
    error: 'El organizationId debe ser un UUID válido.',
  }),
});

export const loginSchema = z.object({
  email: reqString('email')
    .email({ error: 'El formato del email proporcionado no es válido.' })
    .toLowerCase(),
  password: reqString('contraseña').min(1, { error: 'La contraseña no puede estar vacía.' }),
});
