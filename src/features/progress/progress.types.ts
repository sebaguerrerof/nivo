export const progressPeriods = [7, 30, 90] as const

export type ProgressPeriod = (typeof progressPeriods)[number]

export interface ProgressPeriodRange {
  period: ProgressPeriod
  startDate: string
  endDate: string
  previousStartDate: string
  previousEndDate: string
  heatmapStartDate: string
}

export interface ProgressSummaryValues {
  plannedDays: number
  closedDays: number
  dailyScoreAverage: number | null
  activitiesPlanned: number
  activitiesCompleted: number
  completionPercentage: number | null
  xpGained: number
  activeDaysThisMonth?: number
}

export interface DailyScorePoint {
  date: string
  score: number
}

export interface CategoryStat {
  category: string
  planned: number
  completed: number
  percentage: number
}

export interface WeekdayStat {
  weekday: number
  planned: number
  completed: number
  percentage: number | null
}

export interface HeatmapDay {
  date: string
  score: number
  plannedActivities: number
  completedActivities: number
  plannedGoals: number
  completedGoals: number
  closed: boolean
}

export interface XpTimelinePoint {
  weekStart: string
  xp: number
}

export interface MoodPoint {
  date: string
  score: number
}

export interface ProgressAchievement {
  id: string
  code: string
  name: string
  description: string
  icon: string | null
  xpBonus: number
  unlockedAt: string | null
}

export interface ProgressAnalytics {
  summary: {
    current: ProgressSummaryValues
    previous: ProgressSummaryValues
  }
  dailyScores: DailyScorePoint[]
  categories: CategoryStat[]
  weekdays: WeekdayStat[]
  heatmap: HeatmapDay[]
  xpTimeline: XpTimelinePoint[]
  mood: MoodPoint[]
  gamification: {
    totalXp: number
    planningDates: string[]
    achievements: ProgressAchievement[]
  }
}

export interface ProgressInsight {
  id: string
  text: string
  tone: 'positive' | 'neutral'
}