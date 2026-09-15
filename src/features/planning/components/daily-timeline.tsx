import { CalendarClock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ActivityCard } from '@/features/planning/components/activity-card'
import { getActivityTime, getTimelineActivities } from '@/features/planning/planning.utils'
import type { Activity } from '@/types/planning'

interface DailyTimelineProps {
  activities: Activity[]
  currentActivityId?: string
  isWorking: boolean
  now: Date
  onAdd: () => void
  onComplete: (activity: Activity) => Promise<unknown>
  onDelete: (activityId: string) => Promise<unknown>
  onEdit: (activity: Activity) => void
  onMarkNotCompleted: (activity: Activity, reason: string) => Promise<unknown>
  onReschedule: (activity: Activity) => void
  onResetOutcome: (activity: Activity) => Promise<unknown>
  selectedDate: string
  timezone: string
  today: string
}

export function DailyTimeline({ activities, currentActivityId, isWorking, now, onAdd, onComplete, onDelete, onEdit, onMarkNotCompleted, onReschedule, onResetOutcome, selectedDate, timezone, today }: DailyTimelineProps) {
  const remainingActivities = activities.filter((activity) => activity.id !== currentActivityId)
  const { scheduled, unscheduled } = getTimelineActivities(remainingActivities)
  const isPastPending = (activity: Activity) => selectedDate === today && activity.status === 'pending' && Boolean(activity.start_at && new Date(activity.start_at).getTime() < now.getTime())
  const renderActivity = (activity: Activity, showTime: boolean) => (
    <li className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-5" key={activity.id}>
      <p className="pt-4 text-right text-sm font-semibold tabular-nums text-teal-800 dark:text-teal-200">{showTime ? getActivityTime(activity.start_at, timezone) : ''}</p>
      <div className="relative min-w-0 border-l border-[var(--border)] pl-4 before:absolute before:-left-[5px] before:top-5 before:size-2.5 before:rounded-full before:bg-teal-600 before:ring-4 before:ring-[var(--surface)]">
        <ActivityCard activity={activity} contextLabel={isPastPending(activity) ? 'Pendiente anterior' : undefined} isPending={isWorking} onComplete={() => onComplete(activity)} onDelete={() => { if (window.confirm('¿Eliminar esta actividad?')) void onDelete(activity.id) }} onEdit={() => onEdit(activity)} onMarkNotCompleted={(reason) => onMarkNotCompleted(activity, reason)} onReschedule={() => onReschedule(activity)} onResetOutcome={() => onResetOutcome(activity)} timezone={timezone} />
      </div>
    </li>
  )

  return (
    <section aria-labelledby="timeline-title" className="border-t border-[var(--border)] pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200"><CalendarClock aria-hidden="true" className="size-4" /><p className="text-sm font-semibold" id="timeline-title">Lo que sigue</p></div>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Tu timeline mantiene a la vista lo pendiente y lo que ya avanzaste.</p>
        </div>
        <Button className="shrink-0" onClick={onAdd} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar</Button>
      </div>
      {!remainingActivities.length ? <div className="mt-5 border-y border-dashed border-[var(--border)] py-7 text-center"><p className="font-semibold text-[var(--foreground)]">No hay más actividades por ahora.</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Agrega una si quieres reservarle un espacio a algo importante.</p><Button className="mt-4" onClick={onAdd} size="sm" type="button"><Plus aria-hidden="true" className="size-4" />Agregar actividad</Button></div> : <div className="mt-5"><ul>{scheduled.map((activity) => renderActivity(activity, true))}</ul>{unscheduled.length ? <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Sin horario</p><ul className="mt-2">{unscheduled.map((activity) => renderActivity(activity, false))}</ul></div> : null}</div>}
    </section>
  )
}