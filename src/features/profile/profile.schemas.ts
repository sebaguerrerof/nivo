import { z } from 'zod'
import { supportedCurrencies } from '@/types/profile'

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresa tu nombre.').max(80, 'El nombre es demasiado largo.'),
  lastName: z.string().trim().max(80, 'El apellido es demasiado largo.').optional(),
  currency: z.enum(supportedCurrencies),
  timezone: z.string().trim().min(1, 'Selecciona una zona horaria.').max(80),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
