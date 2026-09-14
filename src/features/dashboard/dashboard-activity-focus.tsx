import { CheckCircle2, Clock3, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { activityCategoryOptions } from '@/features/planning/planning.constants'
import { getActivityTime } from '@/features/planning/planning.utils'
import type { Activity } from '@/types/planning'

interface DashboardCurrentActivityProps {
  current: Activity | null
  next: Activity | null
  timezone: string
  isWorking?: boolean
  onComplete: (activity: Activity) => Promise<unknown>
}

function activityCategory(activity: Activity) {
  return activityCategoryOptions.find((item) => item.value === activity.category)?.label ?? activity.category
}

function ActivityTime({ activity, timezone }: { activity: Activity; timezone: string }) {
  const start = getActivityTime(activity.start_at, timezone)
  const end = getActivityTime(activity.end_at, timezone)
  return <span>{start}{end ? ` — ${end}` : ''}</span>
}

export function DashboardCurrentActivity({ current, next, timezone, isWorking = false, onComplete }: DashboardCurrentActivityProps) {
  if (!current) return <section aria-label="Estado actual" className="rounded-[var(--radius-card)] bg-[var(--surface-subtle)] p-5 sm:p-6"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Ahora</p><h2 className="mt-3 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Todo tranquilo por ahora.</h2>{next ? <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Tu próxima actividad comienza a las <strong className="font-semibold text-[var(--foreground)]"><ActivityTime activity={next} timezone={timezone} /></strong>.</p> : <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">No tienes más actividades programadas por ahora.</p>}<Link className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-300" to="/today"><ListChecks aria-hidden="true" className="size-4" />Ver mi día completo</Link></section>

  return <section aria-label="Actividad actual" className="rounded-[var(--radius-card)] bg-[var(--surface-subtle)] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700 dark:text-teal-300">Ahora</p><p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground-muted)]"><Clock3 aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><ActivityTime activity={current} timezone={timezone} /></p><h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">{current.title}</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{activityCategory(current)}</p></div></div><Button className="mt-5 w-full sm:w-auto" loading={isWorking} onClick={() => void onComplete(current)} size="sm" type="button"><CheckCircle2 aria-hidden="true" className="size-4" />Realizado</Button></section>
}

export function DashboardNextActivities({ next, following, timezone }: { next: Activity | null; following: Activity[]; timezone: string }) {
  const activities = [next, ...following].filter((activity): activity is Activity => Boolean(activity))
  return <section aria-label="Próximas actividades" className="border-t border-[var(--border-subtle)] pt-5 sm:pt-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">A continuación</p><h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[var(--foreground)]">Lo que sigue</h2></div><Link className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/today">Ver día</Link></div>{activities.length ? <ol className="mt-4 divide-y divide-[var(--border-subtle)]">{activities.map((activity) => <li className="flex items-center gap-3 py-3 first:pt-0" key={activity.id}><time className="w-12 shrink-0 text-sm font-bold tabular-nums text-[var(--foreground)]"><ActivityTime activity={activity} timezone={timezone} /></time><div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{activity.title}</p><p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{activityCategory(activity)}</p></div></li>)}</ol> : <p className="mt-4 text-sm leading-6 text-[var(--foreground-muted)]">Sin más actividades programadas.</p>}</section>
}