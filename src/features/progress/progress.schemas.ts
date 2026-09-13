import { z } from 'zod'

const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const nullableNumberSchema = z.number().nullable()

const summarySchema = z.object({
  plannedDays: z.number().int().nonnegative(),
  closedDays: z.number().int().nonnegative(),
  dailyScoreAverage: nullableNumberSchema,
  activitiesPlanned: z.number().int().nonnegative(),
  activitiesCompleted: z.number().int().nonnegative(),
  completionPercentage: nullableNumberSchema,
  xpGained: z.number().int().default(0),
  activeDaysThisMonth: z.number().int().nonnegative().optional(),
})

export const progressAnalyticsSchema = z.object({
  summary: z.object({ current: summarySchema, previous: summarySchema }),
  dailyScores: z.array(z.object({ date: calendarDateSchema, score: z.number().int().min(0).max(100) })),
  categories: z.array(z.object({ category: z.string(), planned: z.number().int().nonnegative(), completed: z.number().int().nonnegative(), percentage: z.number().int().min(0).max(100) })),
  weekdays: z.array(z.object({ weekday: z.number().int().min(1).max(7), planned: z.number().int().nonnegative(), completed: z.number().int().nonnegative(), percentage: nullableNumberSchema })),
  heatmap: z.array(z.object({
    date: calendarDateSchema,
    score: z.number().int().min(0).max(100),
    plannedActivities: z.number().int().nonnegative(),
    completedActivities: z.number().int().nonnegative(),
    plannedGoals: z.number().int().nonnegative(),
    completedGoals: z.number().int().nonnegative(),
    closed: z.boolean(),
  })),
  xpTimeline: z.array(z.object({ weekStart: calendarDateSchema, xp: z.number().int() })),
  mood: z.array(z.object({ date: calendarDateSchema, score: z.number().int().min(1).max(10) })),
  gamification: z.object({
    totalXp: z.number().int(),
    planningDates: z.array(calendarDateSchema),
    achievements: z.array(z.object({
      id: z.string().uuid(),
      code: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string().nullable(),
      xpBonus: z.number().int().nonnegative(),
      unlockedAt: z.string().datetime({ offset: true }).nullable(),
    })),
  }),
})