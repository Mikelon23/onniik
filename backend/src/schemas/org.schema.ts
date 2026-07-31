import { z } from 'zod';
import { Role } from '@prisma/client';

const reqString = (fieldName: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? `El ${fieldName} es requerido.`
          : `El ${fieldName} debe ser texto.`,
    })
    .trim();

export const updateOrgSchema = z
  .object({
    name: reqString('nombre de la organización').min(1, {
      error: 'El nombre de la organización no puede estar vacío.',
    }),
  })
  .strict();

export const inviteMemberSchema = z.object({
  email: reqString('email')
    .email({ error: 'El formato del email proporcionado no es válido.' })
    .toLowerCase(),
  name: z.string().trim().optional(),
  role: z
    .nativeEnum(Role, {
      error: () => `Rol inválido. Valores permitidos: ${Object.values(Role).join(', ')}`,
    })
    .optional(),
});

export const acceptInviteSchema = z.object({
  inviteToken: reqString('token de invitación').min(1, {
    error: 'El token de invitación no puede estar vacío.',
  }),
  newPassword: reqString('nueva contraseña')
    .min(8, { error: 'La nueva contraseña debe tener al menos 8 caracteres.' })
    .refine((val) => /[a-zA-Z]/.test(val) && /\d/.test(val), {
      message: 'La nueva contraseña debe incluir al menos una letra y un número.',
    }),
  name: z.string().trim().optional(),
});
