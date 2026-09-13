import { z } from 'zod'
import { generatedPlanDraftSchema, planDraftPromptSchema, type PlanDraft } from '@/features/planning/plan-draft.schemas'
import { authService } from '@/services/auth.service'

interface GeneratePlanDraftInput {
  prompt: string
  date: string
  timezone: string
}

const apiErrorSchema = z.object({ error: z.string().trim().min(1).max(2_000) })
const apiResponseSchema = z.object({ draft: generatedPlanDraftSchema })

export class PlanDraftError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlanDraftError'
  }
}

export const planDraftService = {
  async generate(input: GeneratePlanDraftInput): Promise<PlanDraft> {
    const values = planDraftPromptSchema.parse({ prompt: input.prompt })
    const session = await authService.getSession()

    if (!session) {
      throw new PlanDraftError('Tu sesión terminó. Inicia sesión nuevamente para usar la planificación asistida.')
    }

    const response = await fetch('/api/plan-draft', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: values.prompt, date: input.date, timezone: input.timezone }),
    })
    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(payload)
      throw new PlanDraftError(parsedError.success ? parsedError.data.error : 'No pudimos preparar el borrador. Intenta nuevamente en unos instantes.')
    }

    const parsed = apiResponseSchema.safeParse(payload)
    if (!parsed.success) {
      throw new PlanDraftError('El borrador no tiene un formato válido. Intenta generarlo nuevamente.')
    }

    return { ...parsed.data.draft, date: input.date }
  },
}