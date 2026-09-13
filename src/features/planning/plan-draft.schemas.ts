import { z } from 'zod'
import { activityCategories, activityPriorities } from '@/types/planning'

const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa una hora válida.')
const optionalLocalTimeSchema = z.union([localTimeSchema, z.null()])
const nullableText = (maximum: number) => z.union([z.string().trim().max(maximum, `Máximo ${maximum} caracteres.`), z.null()])

export const planDraftPromptSchema = z.object({
  prompt: z.string().trim().min(10, 'Cuéntanos un poco más para poder ordenar tu día.').max(12_000, 'El texto es demasiado largo.'),
})

export const planDraftActivitySchema = z
  .object({
    title: z.string().trim().min(1, 'Escribe un título.').max(160, 'El título es demasiado largo.'),
    description: nullableText(1_000),
    category: z.enum(activityCategories),
    startTime: optionalLocalTimeSchema,
    endTime: optionalLocalTimeSchema,
    priority: z.enum(activityPriorities),
  })
  .strict()
  .refine((activity) => !activity.startTime || !activity.endTime || activity.endTime > activity.startTime, {
    message: 'La hora de término debe ser posterior al inicio.',
    path: ['endTime'],
  })

export const generatedPlanDraftSchema = z
  .object({
    wakeUpTime: optionalLocalTimeSchema,
    recoveryActivity: nullableText(500),
    responsibilities: nullableText(1_000),
    familyConnection: nullableText(500),
    mainRisk: nullableText(600),
    riskStrategy: nullableText(600),
    dailyCommitment: nullableText(280),
    notes: nullableText(2_000),
    goals: z.array(z.string().trim().min(1, 'Escribe un objetivo.').max(160, 'El objetivo es demasiado largo.')).max(3, 'Puedes guardar hasta tres objetivos.'),
    activities: z.array(planDraftActivitySchema).max(30, 'Puedes guardar hasta treinta actividades.'),
  })
  .strict()

export type GeneratedPlanDraft = z.infer<typeof generatedPlanDraftSchema>
export type PlanDraftPromptValues = z.infer<typeof planDraftPromptSchema>
export type PlanDraft = GeneratedPlanDraft & { date: string }