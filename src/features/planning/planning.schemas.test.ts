import { describe, expect, it } from 'vitest'
import { activitySchema, dailyGoalSchema, dailyPlanSchema, reflectionSchema } from '@/features/planning/planning.schemas'

describe('planning schemas', () => {
  it('accepts an intentionally minimal daily plan', () => {
    expect(dailyPlanSchema.safeParse({ date: '2026-09-12', wakeUpTime: '', dailyCommitment: '', notes: '' }).success).toBe(true)
  })

  it('rejects invalid dates and blank goals', () => {
    expect(dailyPlanSchema.safeParse({ date: '2026-02-30', wakeUpTime: '', dailyCommitment: '', notes: '' }).success).toBe(false)
    expect(dailyGoalSchema.safeParse({ title: '   ' }).success).toBe(false)
  })

  it('requires an end time after the start time', () => {
    expect(
      activitySchema.safeParse({ title: 'Leer', description: '', category: 'reading', startTime: '10:00', endTime: '09:30', priority: 'normal', status: 'pending' }).success,
    ).toBe(false)
  })

  it('keeps the mood score in the expected range', () => {
    expect(reflectionSchema.safeParse({ whatWentWell: '', whatToImprove: '', moodScore: '11' }).success).toBe(false)
    expect(reflectionSchema.safeParse({ whatWentWell: '', whatToImprove: '', moodScore: '8' }).success).toBe(true)
  })
})