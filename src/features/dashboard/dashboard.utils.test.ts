import { describe, expect, it } from 'vitest'
import { getDashboardActivitySnapshot } from '@/features/dashboard/dashboard.utils'
import type { Activity } from '@/types/planning'

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
    not_completed_reason: null,
    created_at: '2026-09-14T10:00:00.000Z',
    updated_at: '2026-09-14T10:00:00.000Z',
    ...overrides,
  }
}

describe('dashboard activity snapshot', () => {
  it('selects only a pending activity whose time range contains now', () => {
    const snapshot = getDashboardActivitySnapshot([
      activity({ id: 'done', status: 'completed', start_at: '2026-09-14T12:00:00.000Z', end_at: '2026-09-14T13:00:00.000Z' }),
      activity({ id: 'current', start_at: '2026-09-14T10:00:00.000Z', end_at: '2026-09-14T11:00:00.000Z' }),
      activity({ id: 'next', start_at: '2026-09-14T13:00:00.000Z', end_at: '2026-09-14T14:00:00.000Z' }),
    ], new Date('2026-09-14T10:30:00.000Z'))

    expect(snapshot.current?.id).toBe('current')
    expect(snapshot.next?.id).toBe('next')
  })

  it('orders the next two scheduled activities and excludes activities without an end time from now', () => {
    const snapshot = getDashboardActivitySnapshot([
      activity({ id: 'open-ended', start_at: '2026-09-14T09:00:00.000Z' }),
      activity({ id: 'later', start_at: '2026-09-14T16:00:00.000Z', end_at: '2026-09-14T17:00:00.000Z' }),
      activity({ id: 'first', start_at: '2026-09-14T13:00:00.000Z', end_at: '2026-09-14T14:00:00.000Z' }),
      activity({ id: 'second', start_at: '2026-09-14T14:00:00.000Z', end_at: '2026-09-14T15:00:00.000Z' }),
    ], new Date('2026-09-14T12:00:00.000Z'))

    expect(snapshot.current).toBeNull()
    expect(snapshot.next?.id).toBe('first')
    expect(snapshot.following.map((item) => item.id)).toEqual(['second', 'later'])
  })
})