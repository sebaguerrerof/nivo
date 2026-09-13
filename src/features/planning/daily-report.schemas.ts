import { z } from 'zod'
import { generatedPlanDraftSchema } from '@/features/planning/plan-draft.schemas'

export const dailyReportFormSchema = z.object({
  feelings: z.string().trim().min(3, 'Cuéntanos brevemente cómo te sentiste.').max(2_000, 'Máximo 2.000 caracteres.'),
  todaySummary: z.string().trim().min(3, 'Cuéntanos qué hiciste o qué quedó pendiente.').max(3_000, 'Máximo 3.000 caracteres.'),
  tomorrowPrompt: z.string().trim().min(10, 'Describe un poco más cómo quieres organizar mañana.').max(8_000, 'Máximo 8.000 caracteres.'),
})

export const generatedDailyReportSchema = z.object({
  groupReport: z.string().trim().min(1, 'El reporte no puede estar vacío.').max(8_000, 'El reporte es demasiado largo.'),
  plan: generatedPlanDraftSchema,
})

export type DailyReportFormValues = z.infer<typeof dailyReportFormSchema>
export type GeneratedDailyReport = z.infer<typeof generatedDailyReportSchema>
