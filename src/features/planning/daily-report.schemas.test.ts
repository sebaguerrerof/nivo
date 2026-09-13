import { describe, expect, it } from 'vitest'
import { dailyReportFormSchema, generatedDailyReportSchema } from '@/features/planning/daily-report.schemas'

const validPlan = {
  wakeUpTime: '07:30',
  recoveryActivity: 'Caminar',
  responsibilities: 'Trabajar',
  familyConnection: null,
  mainRisk: null,
  riskStrategy: null,
  dailyCommitment: 'Ir paso a paso',
  notes: null,
  goals: ['Trabajar con calma'],
  activities: [{ title: 'Desayunar', description: null, category: 'personal', startTime: '08:00', endTime: null, priority: 'normal' }],
}

describe('daily report schemas', () => {
  it('requires the personal closing inputs before generating a report', () => {
    expect(dailyReportFormSchema.safeParse({ feelings: 'Bien', todaySummary: 'Avancé', tomorrowPrompt: 'Mañana trabajaré con calma.' }).success).toBe(true)
    expect(dailyReportFormSchema.safeParse({ feelings: '', todaySummary: 'Avancé', tomorrowPrompt: 'Mañana trabajaré con calma.' }).success).toBe(false)
  })

  it('accepts a report paired with a structured next-day plan', () => {
    expect(generatedDailyReportSchema.safeParse({ groupReport: 'Buenas noches grupo, me reporto.', plan: validPlan }).success).toBe(true)
    expect(generatedDailyReportSchema.safeParse({ groupReport: '', plan: validPlan }).success).toBe(false)
  })
})
