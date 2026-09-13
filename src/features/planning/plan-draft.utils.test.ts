import { describe, expect, it } from 'vitest'
import { toDailyPlanDraftInput } from '@/features/planning/plan-draft.utils'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'

describe('plan draft persistence mapper', () => {
  it('keeps the approved content separate and converts local times to instants', () => {
    const draft: PlanDraft = {
      date: '2026-09-13',
      wakeUpTime: '07:30',
      recoveryActivity: 'Terapia',
      responsibilities: 'Trabajar',
      familyConnection: null,
      mainRisk: 'Procrastinar',
      riskStrategy: 'Seguir el horario',
      dailyCommitment: 'Terminar tranquilo',
      notes: null,
      goals: ['Hacer deporte'],
      activities: [{ title: 'Gym', description: null, category: 'sport', startTime: '08:30', endTime: null, priority: 'high' }],
    }

    const input = toDailyPlanDraftInput(draft, 'America/Santiago')

    expect(input.plan).toMatchObject({ date: '2026-09-13', mainRisk: 'Procrastinar' })
    expect(input.goals).toEqual([{ title: 'Hacer deporte', position: 0 }])
    expect(input.activities[0]).toMatchObject({ title: 'Gym', category: 'sport', status: 'pending' })
    expect(input.activities[0]?.startAt).toContain('2026-09-13T11:30:00.000Z')
  })
})