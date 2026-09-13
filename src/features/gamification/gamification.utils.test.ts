import { describe, expect, it } from 'vitest'
import { calculateLevel, calculatePlanningStreak } from '@/features/gamification/gamification.utils'
import { dailyScoreService } from '@/services/daily-score.service'
import type { Activity, DailyGoal } from '@/types/planning'

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'activity-1',
    user_id: 'user-1',
    daily_plan_id: 'plan-1',
    title: 'Actividad',
    description: null,
    category: 'personal',
    start_at: null,
    end_at: null,
    priority: 'normal',
    status: 'pending',
    completed_at: null,
    created_at: '2026-09-12T12:00:00.000Z',
    updated_at: '2026-09-12T12:00:00.000Z',
    ...overrides,
  }
}

function goal(overrides: Partial<DailyGoal> = {}): DailyGoal {
  return {
    id: 'goal-1',
    daily_plan_id: 'plan-1',
    user_id: 'user-1',
    title: 'Objetivo',
    position: 0,
    completed: false,
    completed_at: null,
    created_at: '2026-09-12T12:00:00.000Z',
    updated_at: '2026-09-12T12:00:00.000Z',
    ...overrides,
  }
}

describe('gamification utilities', () => {
  it('calculates level progress from a central threshold table', () => {
    expect(calculateLevel(0)).toMatchObject({ level: 1, progressPercentage: 0, nextLevelXp: 100 })
    expect(calculateLevel(100)).toMatchObject({ level: 2, progressPercentage: 0, levelStartXp: 100 })
    expect(calculateLevel(175)).toMatchObject({ level: 2, progressPercentage: 50 })
    expect(calculateLevel(2700)).toMatchObject({ level: 10, progressPercentage: 0 })
  })

  it('derives current and best planning streaks without counting future days', () => {
    expect(calculatePlanningStreak(['2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-20'], '2026-09-12')).toEqual({ current: 4, best: 4 })
    expect(calculatePlanningStreak(['2026-09-09', '2026-09-10'], '2026-09-12')).toEqual({ current: 0, best: 2 })
  })

  it('calculates the Daily Score with only applicable planning categories', () => {
    expect(dailyScoreService.calculate({ activities: [], goals: [], isClosed: true })).toBe(0)
    expect(dailyScoreService.calculate({ activities: [activity({ status: 'completed' }), activity({ id: 'activity-2' })], goals: [goal({ completed: true })], isClosed: false })).toBe(59)
    expect(dailyScoreService.calculate({ activities: [activity({ status: 'completed' }), activity({ id: 'activity-2' })], goals: [goal({ completed: true })], isClosed: true })).toBe(71)
  })
})
