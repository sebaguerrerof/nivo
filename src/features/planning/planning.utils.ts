import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'
import type { Activity, ActivityStatus } from '@/types/planning'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'

export interface DailyProgress {
  completed: number
  total: number
  percentage: number
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? ''
}

export function getTodayInTimeZone(timezone = DEFAULT_TIMEZONE, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  return `${getPart(parts, 'year')}-${getPart(parts, 'month')}-${getPart(parts, 'day')}`
}

export function formatPlanDate(date: string, timezone = DEFAULT_TIMEZONE) {
  const safeDate = new Date(`${date}T12:00:00Z`)
  const value = formatInTimeZone(safeDate, timezone, "EEEE d 'de' MMMM", { locale: es })
  return value.charAt(0).toLocaleUpperCase('es-CL') + value.slice(1)
}

export function toActivityInstant(date: string, time: string | null | undefined, timezone = DEFAULT_TIMEZONE) {
  if (!time) return null
  return fromZonedTime(`${date}T${time}:00`, timezone).toISOString()
}

export function getActivityTime(instant: string | null, timezone = DEFAULT_TIMEZONE) {
  if (!instant) return null
  return formatInTimeZone(instant, timezone, 'HH:mm')
}

export function getDailyProgress(activities: Activity[]): DailyProgress {
  const completed = activities.filter((activity) => activity.status === 'completed').length
  const total = activities.length

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}

export function getToggledActivityStatus(status: ActivityStatus): ActivityStatus {
  return status === 'completed' ? 'pending' : 'completed'
}

export function getTimelineActivities(activities: Activity[]) {
  const scheduled = activities
    .filter((activity) => activity.start_at)
    .sort((first, second) => first.start_at!.localeCompare(second.start_at!))
  const unscheduled = activities.filter((activity) => !activity.start_at)

  return { scheduled, unscheduled }
}

export function getNextGoalPosition(positions: number[]) {
  return positions.length === 0 ? 0 : Math.max(...positions) + 1
}

export function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizeTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : ''
}

export function formatClosedAt(value: string, timezone = DEFAULT_TIMEZONE) {
  return formatInTimeZone(value, timezone, "d 'de' MMMM, HH:mm", { locale: es })
}

export function formatLocalDateTime(value: string, timezone = DEFAULT_TIMEZONE) {
  return formatInTimeZone(value, timezone, "d 'de' MMMM 'a las' HH:mm", { locale: es })
}

export function getGreetingInTimeZone(timezone = DEFAULT_TIMEZONE, now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone: timezone }).format(now),
  )

  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function formatTimeValue(value: string) {
  return format(new Date(`1970-01-01T${value}:00`), 'HH:mm')
}
