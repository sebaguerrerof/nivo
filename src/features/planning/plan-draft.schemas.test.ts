import { describe, expect, it } from 'vitest'
import { generatedPlanDraftSchema, planDraftPromptSchema } from '@/features/planning/plan-draft.schemas'

describe('plan draft schemas', () => {
  const validDraft = {
    wakeUpTime: '07:30',
    recoveryActivity: 'Terapia y caminar.',
    responsibilities: 'Avanzar en mis proyectos.',
    familyConnection: 'Compartir con mis papás.',
    mainRisk: 'Procrastinar al comenzar.',
    riskStrategy: 'Seguir la planificación desde la mañana.',
    dailyCommitment: 'Mantenerme activo y terminar tranquilo.',
    notes: null,
    goals: ['Hacer deporte', 'Avanzar en proyectos', 'Cumplir con terapias'],
    activities: [
      { title: 'Gym', description: null, category: 'sport', startTime: '08:30', endTime: null, priority: 'high' },
      { title: 'Terapia online', description: null, category: 'therapy', startTime: '14:00', endTime: null, priority: 'normal' },
    ],
  }

  it('accepts a structured draft from natural language', () => {
    expect(generatedPlanDraftSchema.safeParse(validDraft).success).toBe(true)
    expect(planDraftPromptSchema.safeParse({ prompt: 'Mañana quiero trabajar, hacer deporte y terminar tranquilo.' }).success).toBe(true)
  })

  it('rejects invalid times and more than three goals', () => {
    expect(generatedPlanDraftSchema.safeParse({ ...validDraft, wakeUpTime: '25:00' }).success).toBe(false)
    expect(generatedPlanDraftSchema.safeParse({ ...validDraft, goals: ['uno', 'dos', 'tres', 'cuatro'] }).success).toBe(false)
  })
})