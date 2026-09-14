import { z } from 'zod'
import { onboardingInterestOptions, supportedCurrencies } from '@/types/profile'

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresa tu nombre.').max(80, 'El nombre es demasiado largo.'),
  lastName: z.string().trim().max(80, 'El apellido es demasiado largo.').optional(),
  currency: z.enum(supportedCurrencies),
  timezone: z.string().trim().min(1, 'Selecciona una zona horaria.').max(80),
  avatarUrl: z.union([z.string().url('Ingresa una URL válida.'), z.literal('')]).optional(),
})

export const onboardingBasicsSchema = profileSchema.pick({ firstName: true, lastName: true, currency: true, timezone: true })

export const onboardingInterestsSchema = z.object({
  interests: z.array(z.enum(onboardingInterestOptions)).max(8),
})

export type ProfileFormValues = z.infer<typeof profileSchema>