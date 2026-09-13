import { describe, expect, it } from 'vitest'
import { buildProgressInsights, getComparison, getHeatmapLevel, getProgressPeriodRange, hasProgressData } from '@/features/progress/progress.utils'
import type { ProgressAnalytics } from '@/features/progress/progress.types'

function analytics(overrides: Partial<ProgressAnalytics> = {}): ProgressAnalytics {
  return {
    summary: {
      current: { plannedDays: 5, closedDays: 4, dailyScoreAverage: 78, activitiesPlanned: 10, activitiesCompleted: 8, completionPercentage: 80, xpGained: 95, activeDaysThisMonth: 5 },
      previous: { plannedDays: 5, closedDays: 2, dailyScoreAverage: 70, activitiesPlanned: 8, activitiesCompleted: 5, completionPercentage: 63, xpGained: 0 },
    },
    dailyScores: [{ date: '2026-09-10', score: 78 }],
    categories: [{ category: 'sport', planned: 4, completed: 4, percentage: 100 }, { category: 'work', planned: 6, completed: 4, percentage: 67 }],
    weekdays: [
      { weekday: 1, planned: 1, completed: 1, percentage: 100 },
      { weekday: 2, planned: 2, completed: 2, percentage: 100 },
      { weekday: 3, planned: 0, completed: 0, percentage: null },
      { weekday: 4, planned: 0, completed: 0, percentage: null },
      { weekday: 5, planned: 0, completed: 0, percentage: null },
      { weekday: 6, planned: 0, completed: 0, percentage: null },
      { weekday: 7, planned: 0, completed: 0, percentage: null },
    ],
    heatmap: [],
    xpTimeline: [],
    mood: [],
    gamification: { totalXp: 120, planningDates: ['2026-09-09', '2026-09-10', '2026-09-11'], achievements: [] },
    ...overrides,
  }
}

describe('progress utilities', () => {
  it('derives aligned current and previous periods without an off-by-one day', () => {
    expect(getProgressPeriodRange(30, '2026-03-01')).toMatchObject({ startDate: '2026-01-31', endDate: '2026-03-01', previousStartDate: '2026-01-01', previousEndDate: '2026-01-30', heatmapStartDate: '2025-12-02' })
    expect(getProgressPeriodRange(7, '2026-01-01')).toMatchObject({ startDate: '2025-12-26', previousStartDate: '2025-12-19' })
  })

  it('only compares metrics when both periods have enough information', () => {
    expect(getComparison(78, 70, 5, 5)).toBe(8)
    expect(getComparison(78, 70, 2, 5)).toBeNull()
    expect(getComparison(null, 70, 5, 5)).toBeNull()
  })

  it('maps Daily Score values to the defined heatmap intensity ranges', () => {
    expect(getHeatmapLevel(0)).toBe(1)
    expect(getHeatmapLevel(49)).toBe(1)
    expect(getHeatmapLevel(50)).toBe(2)
    expect(getHeatmapLevel(84)).toBe(3)
    expect(getHeatmapLevel(85)).toBe(4)
  })

  it('creates deterministic, non-clinical insights from existing metrics', () => {
    const insights = buildProgressInsights(analytics(), { current: 3, best: 4 }).map((insight) => insight.text)
    expect(insights).toContain('Tu Daily Score promedio aumentó 8 puntos respecto al período anterior.')
    expect(insights).toContain('Deporte es tu categoría con mayor cumplimiento: 100%.')
    expect(insights).toContain('Has planificado 3 días consecutivos.')
  })

  it('identifies the new-user empty state from planning data', () => {
    expect(hasProgressData(analytics({ summary: { current: { plannedDays: 0, closedDays: 0, dailyScoreAverage: null, activitiesPlanned: 0, activitiesCompleted: 0, completionPercentage: null, xpGained: 0 }, previous: { plannedDays: 0, closedDays: 0, dailyScoreAverage: null, activitiesPlanned: 0, activitiesCompleted: 0, completionPercentage: null, xpGained: 0 } } }))).toBe(false)
    expect(hasProgressData(analytics())).toBe(true)
  })
})