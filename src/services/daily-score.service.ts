import type { Activity, DailyGoal } from '@/types/planning'

interface DailyScoreInput {
  activities: Activity[]
  goals: DailyGoal[]
  isClosed: boolean
}

export const dailyScoreService = {
  calculate({ activities, goals, isClosed }: DailyScoreInput) {
    if (activities.length === 0 && goals.length === 0) return 0

    const factors = [
      activities.length > 0
        ? { weight: 50, completion: activities.filter((activity) => activity.status === 'completed').length / activities.length }
        : null,
      goals.length > 0
        ? { weight: 25, completion: goals.filter((goal) => goal.completed).length / goals.length }
        : null,
      { weight: 10, completion: isClosed ? 1 : 0 },
    ].filter((factor): factor is { weight: number; completion: number } => factor !== null)

    const totalWeight = factors.reduce((total, factor) => total + factor.weight, 0)
    const weightedScore = factors.reduce((total, factor) => total + factor.completion * factor.weight, 0)

    return Math.min(100, Math.max(0, Math.round((weightedScore / totalWeight) * 100)))
  },
}
