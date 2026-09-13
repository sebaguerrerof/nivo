import { z } from 'zod'
import { activityCategories, activityPriorities, activityStatuses } from '@/types/planning'

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const candidate = new Date(Date.UTC(year, month - 1, day))
    return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
  }, 'Selecciona una fecha válida.')
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa una hora válida.')
const optionalTimeSchema = z.union([timeSchema, z.literal('')])
const optionalText = (maximum: number) => z.string().trim().max(maximum, `Máximo ${maximum} caracteres.`).optional()

export const dailyPlanSchema = z.object({
  date: dateSchema,
  wakeUpTime: optionalTimeSchema,
  recoveryActivity: optionalText(500),
  responsibilities: optionalText(1_000),
  familyConnection: optionalText(500),
  mainRisk: optionalText(600),
  riskStrategy: optionalText(600),
  dailyCommitment: optionalText(280),
  notes: optionalText(2_000),
})

export const dailyGoalSchema = z.object({
  title: z.string().trim().min(1, 'Escribe un objetivo.').max(160, 'El objetivo es demasiado largo.'),
})

export const activitySchema = z
  .object({
    title: z.string().trim().min(1, 'Escribe un título.').max(160, 'El título es demasiado largo.'),
    description: optionalText(1_000),
    category: z.enum(activityCategories),
    startTime: optionalTimeSchema,
    endTime: optionalTimeSchema,
    priority: z.enum(activityPriorities),
    status: z.enum(activityStatuses),
  })
  .refine(
    (values) => !values.startTime || !values.endTime || values.endTime > values.startTime,
    { message: 'La hora de término debe ser posterior al inicio.', path: ['endTime'] },
  )

export const activityOutcomeSchema = z.object({
  reason: z.string().trim().min(1, 'Cuéntanos brevemente por qué no se realizó.').max(500, 'Máximo 500 caracteres.'),
})

export const reflectionSchema = z.object({
  whatWentWell: optionalText(1_000),
  whatToImprove: optionalText(1_000),
  moodScore: z.union([z.literal(''), z.coerce.number().int().min(1, 'El ánimo va de 1 a 10.').max(10, 'El ánimo va de 1 a 10.')]),
})

export type DailyPlanFormValues = z.infer<typeof dailyPlanSchema>
export type DailyGoalFormValues = z.infer<typeof dailyGoalSchema>
export type ActivityFormValues = z.infer<typeof activitySchema>
export type ReflectionFormValues = z.infer<typeof reflectionSchema>