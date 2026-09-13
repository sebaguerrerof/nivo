import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { activityCategoryOptions } from '@/features/planning/planning.constants'
import type { ProgressAnalytics, ProgressInsight, ProgressPeriod, ProgressPeriodRange, WeekdayStat } from '@/features/progress/progress.types'
import type { StreakSummary } from '@/types/gamification'

const weekdayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function offsetCalendarDate(value: string, offset: number) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10)
}

function asDate(value: string) {
  return new Date(`${value}T12:00:00Z`)
}

export function getProgressPeriodRange(period: ProgressPeriod, endDate: string): ProgressPeriodRange {
  const startDate = offsetCalendarDate(endDate, -(period - 1))
  const previousEndDate = offsetCalendarDate(startDate, -1)

  return {
    period,
    startDate,
    endDate,
    previousStartDate: offsetCalendarDate(previousEndDate, -(period - 1)),
    previousEndDate,
    heatmapStartDate: offsetCalendarDate(endDate, -89),
  }
}

export function getCategoryLabel(category: string) {
  return activityCategoryOptions.find((option) => option.value === category)?.label ?? category
}

export function getWeekdayLabel(weekday: number) {
  return weekdayLabels[weekday - 1] ?? ''
}

export function formatProgressDate(date: string) {
  return format(asDate(date), "d 'de' MMMM", { locale: es })
}

export function formatChartDate(date: string) {
  return format(asDate(date), 'd MMM', { locale: es })
}

export function formatWeekStart(date: string) {
  return `Semana del ${format(asDate(date), 'd MMM', { locale: es })}`
}

export function getComparison(current: number | null, previous: number | null, currentSampleSize: number, previousSampleSize: number, minimumSampleSize = 3) {
  if (current === null || previous === null || currentSampleSize < minimumSampleSize || previousSampleSize < minimumSampleSize) return null
  return current - previous
}

export function getHeatmapLevel(score: number) {
  if (score < 50) return 1
  if (score < 70) return 2
  if (score < 85) return 3
  return 4
}

function getBestWeekday(weekdays: WeekdayStat[]) {
  return weekdays.filter((weekday) => weekday.planned > 0 && weekday.percentage !== null).sort((first, second) => (second.percentage ?? 0) - (first.percentage ?? 0))[0]
}

export function hasProgressData(analytics: ProgressAnalytics) {
  return analytics.summary.current.plannedDays > 0
}

export function buildProgressInsights(analytics: ProgressAnalytics, streak: StreakSummary): ProgressInsight[] {
  const insights: ProgressInsight[] = []
  const dailyScoreDelta = getComparison(
    analytics.summary.current.dailyScoreAverage,
    analytics.summary.previous.dailyScoreAverage,
    analytics.summary.current.plannedDays,
    analytics.summary.previous.plannedDays,
  )

  if (dailyScoreDelta !== null && dailyScoreDelta > 0) {
    insights.push({ id: 'daily-score-up', tone: 'positive', text: `Tu Daily Score promedio aumentó ${dailyScoreDelta} puntos respecto al período anterior.` })
  }

  const bestCategory = analytics.categories[0]
  if (bestCategory && bestCategory.planned > 0) {
    insights.push({ id: 'best-category', tone: 'positive', text: `${getCategoryLabel(bestCategory.category)} es tu categoría con mayor cumplimiento: ${bestCategory.percentage}%.` })
  }

  const bestWeekday = getBestWeekday(analytics.weekdays)
  if (bestWeekday && bestWeekday.percentage !== null) {
    insights.push({ id: 'best-weekday', tone: 'neutral', text: `${getWeekdayLabel(bestWeekday.weekday)} es actualmente tu día con mejor cumplimiento: ${bestWeekday.percentage}%.` })
  }

  if (streak.current >= 2) {
    insights.push({ id: 'streak', tone: 'positive', text: `Has planificado ${streak.current} días consecutivos.` })
  }

  const { closedDays, plannedDays } = analytics.summary.current
  if (plannedDays > 0) {
    insights.push({ id: 'closures', tone: 'neutral', text: `Has cerrado ${closedDays} de tus últimos ${plannedDays} días planificados.` })
  }

  return insights.slice(0, 4)
}