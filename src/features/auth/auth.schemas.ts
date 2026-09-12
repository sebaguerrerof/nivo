import { z } from 'zod'

const emailSchema = z.string().trim().email('Ingresa un correo válido.')
const passwordSchema = z
  .string()
  .min(8, 'Usa al menos 8 caracteres.')
  .max(72, 'Usa como máximo 72 caracteres.')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Ingresa tu nombre.').max(80, 'El nombre es demasiado largo.'),
    lastName: z.string().trim().max(80, 'El apellido es demasiado largo.').optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export const emailOnlySchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type EmailOnlyFormValues = z.infer<typeof emailOnlySchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
