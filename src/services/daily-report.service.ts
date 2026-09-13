import { z } from 'zod'
import { dailyReportFormSchema, generatedDailyReportSchema, type GeneratedDailyReport } from '@/features/planning/daily-report.schemas'
import { authService } from '@/services/auth.service'

interface GenerateDailyReportInput {
  feelings: string
  planId: string
  todaySummary: string
  tomorrowDate: string
  tomorrowPrompt: string
  timezone: string
}

const requestSchema = dailyReportFormSchema.extend({
  planId: z.string().uuid(),
  tomorrowDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().trim().min(1).max(100),
})
const apiErrorSchema = z.object({ error: z.string().trim().min(1).max(2_000) })
const apiResponseSchema = z.object({ result: generatedDailyReportSchema })

export class DailyReportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DailyReportError'
  }
}

export const dailyReportService = {
  async generate(input: GenerateDailyReportInput): Promise<GeneratedDailyReport> {
    const values = requestSchema.parse(input)
    const session = await authService.getSession()
    if (!session) throw new DailyReportError('Tu sesión terminó. Inicia sesión nuevamente para generar el reporte.')

    const response = await fetch('/api/daily-report', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(payload)
      throw new DailyReportError(parsedError.success ? parsedError.data.error : 'No pudimos preparar el reporte. Intenta nuevamente en unos instantes.')
    }

    const parsed = apiResponseSchema.safeParse(payload)
    if (!parsed.success) throw new DailyReportError('El reporte no tiene un formato válido. Intenta generarlo nuevamente.')
    return parsed.data.result
  },
}
