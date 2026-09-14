import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Activity } from '@/types/planning'

export interface DashboardActivitySnapshot {
  current: Activity | null
  next: Activity | null
  following: Activity[]
}

export function getGreeting(now = new Date(), timezone?: string) {
  const hour = timezone
    ? Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone: timezone }).format(now))
    : now.getHours()

  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function getLongDate(now = new Date(), timezone?: string) {
  const value = timezone
    ? new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone }).format(now)
    : format(now, "EEEE d 'de' MMMM", { locale: es })
  return value.charAt(0).toLocaleUpperCase('es-CL') + value.slice(1)
}

function isPendingScheduledActivity(activity: Activity) {
  return activity.status === 'pending' && Boolean(activity.start_at)
}

function timeOf(activity: Activity) {
  return activity.start_at ? new Date(activity.start_at).getTime() : Number.POSITIVE_INFINITY
}

export function getDashboardActivitySnapshot(activities: Activity[], now = new Date()): DashboardActivitySnapshot {
  const currentTime = now.getTime()
  const scheduled = activities.filter(isPendingScheduledActivity).sort((left, right) => timeOf(left) - timeOf(right))
  const current = scheduled.find((activity) => {
    if (!activity.start_at || !activity.end_at) return false
    const startsAt = new Date(activity.start_at).getTime()
    const endsAt = new Date(activity.end_at).getTime()
    return Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= currentTime && currentTime < endsAt
  }) ?? null
  const upcoming = scheduled.filter((activity) => timeOf(activity) > currentTime)

  return {
    current,
    next: upcoming[0] ?? null,
    following: upcoming.slice(1, 3),
  }
}