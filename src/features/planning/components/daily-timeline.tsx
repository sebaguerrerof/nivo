import { CalendarClock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ActivityCard } from '@/features/planning/components/activity-card'
import { getActivityTime, getTimelineActivities } from '@/features/planning/planning.utils'
import type { Activity } from '@/types/planning'

interface DailyTimelineProps {
  activities: Activity[]
  isWorking: boolean
  onAdd: () => void
  onComplete: (activity: Activity) => Promise<unknown>
  onDelete: (activityId: string) => Promise<unknown>
  onEdit: (activity: Activity) => void
  onMarkNotCompleted: (activity: Activity, reason: string) => Promise<unknown>
  onReschedule: (activity: Activity) => void
  onResetOutcome: (activity: Activity) => Promise<unknown>
  timezone: string
}

export function DailyTimeline({ activities, isWorking, onAdd, onComplete, onDelete, onEdit, onMarkNotCompleted, onReschedule, onResetOutcome, timezone }: DailyTimelineProps) {
  const { scheduled, unscheduled } = getTimelineActivities(activities)
  const renderActivity = (activity: Activity, showTime: boolean) => (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4" key={activity.id}>
      <p className="pt-4 text-right text-sm font-semibold tabular-nums text-teal-700 dark:text-teal-300">{showTime ? getActivityTime(activity.start_at, timezone) : ''}</p>
      <ActivityCard activity={activity} isPending={isWorking} onComplete={() => onComplete(activity)} onDelete={() => { if (window.confirm('¿Eliminar esta actividad?')) void onDelete(activity.id) }} onEdit={() => onEdit(activity)} onMarkNotCompleted={(reason) => onMarkNotCompleted(activity, reason)} onReschedule={() => onReschedule(activity)} onResetOutcome={() => onResetOutcome(activity)} timezone={timezone} />
    </div>
  )

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><CalendarClock aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Tu timeline</p></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">Marca lo realizado o deja un motivo breve cuando algo no resultó.</p></div><Button className="shrink-0" onClick={onAdd} size="sm"><Plus aria-hidden="true" className="size-4" />Agregar</Button></div>
      {!activities.length ? <div className="mt-6 rounded-xl bg-[var(--surface-muted)] px-4 py-6 text-center"><p className="font-semibold text-[var(--foreground)]">No tienes actividades todavía.</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Agrega la primera actividad de tu día.</p><Button className="mt-4" onClick={onAdd} size="sm"><Plus aria-hidden="true" className="size-4" />Agregar actividad</Button></div> : <div className="mt-6 grid gap-3">{scheduled.map((activity) => renderActivity(activity, true))}{unscheduled.length ? <><p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Sin horario</p>{unscheduled.map((activity) => renderActivity(activity, false))}</> : null}</div>}
    </Card>
  )
}