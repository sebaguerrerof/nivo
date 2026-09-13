import { toActivityInstant } from '@/features/planning/planning.utils'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'
import type { DailyPlanDraftInput } from '@/types/planning'

export function toDailyPlanDraftInput(draft: PlanDraft, timezone: string): DailyPlanDraftInput {
  return {
    plan: {
      date: draft.date,
      wakeUpTime: draft.wakeUpTime,
      recoveryActivity: draft.recoveryActivity,
      responsibilities: draft.responsibilities,
      familyConnection: draft.familyConnection,
      mainRisk: draft.mainRisk,
      riskStrategy: draft.riskStrategy,
      dailyCommitment: draft.dailyCommitment,
      notes: draft.notes,
    },
    goals: draft.goals.map((title, position) => ({ title, position })),
    activities: draft.activities.map((activity) => ({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      startAt: toActivityInstant(draft.date, activity.startTime, timezone),
      endAt: toActivityInstant(draft.date, activity.endTime, timezone),
      priority: activity.priority,
      status: 'pending',
    })),
  }
}