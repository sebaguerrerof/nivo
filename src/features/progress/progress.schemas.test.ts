import { describe, expect, it } from 'vitest'
import { progressAnalyticsSchema } from '@/features/progress/progress.schemas'

describe('progress analytics schema', () => {
  it('accepts a single aggregated response with categories, weekday stats and heatmap data', () => {
    const result = progressAnalyticsSchema.safeParse({
      summary: { current: { plannedDays: 1, closedDays: 1, dailyScoreAverage: 80, activitiesPlanned: 2, activitiesCompleted: 2, completionPercentage: 100, xpGained: 45, activeDaysThisMonth: 1 }, previous: { plannedDays: 0, closedDays: 0, dailyScoreAverage: null, activitiesPlanned: 0, activitiesCompleted: 0, completionPercentage: null, xpGained: 0 } },
      dailyScores: [{ date: '2026-09-13', score: 80 }],
      categories: [{ category: 'sport', planned: 1, completed: 1, percentage: 100 }],
      weekdays: [{ weekday: 7, planned: 1, completed: 1, percentage: 100 }],
      heatmap: [{ date: '2026-09-13', score: 80, plannedActivities: 2, completedActivities: 2, plannedGoals: 1, completedGoals: 1, closed: true }],
      xpTimeline: [{ weekStart: '2026-09-07', xp: 45 }],
      mood: [{ date: '2026-09-13', score: 7 }],
      gamification: { totalXp: 45, planningDates: ['2026-09-13'], achievements: [] },
    })

    expect(result.success).toBe(true)
  })
})