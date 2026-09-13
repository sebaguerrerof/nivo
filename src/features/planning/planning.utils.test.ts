import { describe, expect, it } from 'vitest'
import type { Activity } from '@/types/planning'
import {
  getActivityTime,
  getDailyProgress,
  getDateFromPlanSearch,
  getNextCalendarDate,
  getNextGoalPosition,
  getTimelineActivities,
  getTodayInTimeZone,
  getToggledActivityStatus,
  toActivityInstant,
} from '@/features/planning/planning.utils'

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

describe('planning utilities', () => {
  it('derives daily progress without persisting it', () => {
    expect(getDailyProgress([])).toEqual({ completed: 0, total: 0, percentage: 0 })
    expect(getDailyProgress([activity({ status: 'completed' }), activity({ id: 'activity-2' }), activity({ id: 'activity-3' })])).toEqual({
      completed: 1,
      total: 3,
      percentage: 33,
    })
  })

  it('orders scheduled activities before activities without a time', () => {
    const timeline = getTimelineActivities([
      activity({ id: 'later', start_at: '2026-09-12T15:00:00.000Z' }),
      activity({ id: 'unscheduled' }),
      activity({ id: 'earlier', start_at: '2026-09-12T12:00:00.000Z' }),
    ])

    expect(timeline.scheduled.map((item) => item.id)).toEqual(['earlier', 'later'])
    expect(timeline.unscheduled.map((item) => item.id)).toEqual(['unscheduled'])
  })

  it('uses the configured Santiago date and preserves local activity times', () => {
    expect(getTodayInTimeZone('America/Santiago', new Date('2026-09-12T02:30:00.000Z'))).toBe('2026-09-11')
    const instant = toActivityInstant('2026-09-12', '09:30', 'America/Santiago')
    expect(getActivityTime(instant, 'America/Santiago')).toBe('09:30')
  })

  it('validates date parameters and calculates the following calendar date', () => {
    expect(getNextCalendarDate('2026-09-12')).toBe('2026-09-13')
    expect(getNextCalendarDate('2026-12-31')).toBe('2027-01-01')
    expect(getDateFromPlanSearch('?date=2026-09-13')).toBe('2026-09-13')
    expect(getDateFromPlanSearch('?date=2026-02-29')).toBeNull()
    expect(getDateFromPlanSearch('?date=not-a-date')).toBeNull()
  })

  it('toggles completion and assigns the next goal position', () => {
    expect(getToggledActivityStatus('pending')).toBe('completed')
    expect(getToggledActivityStatus('completed')).toBe('pending')
    expect(getNextGoalPosition([])).toBe(0)
    expect(getNextGoalPosition([0, 3, 1])).toBe(4)
  })
})