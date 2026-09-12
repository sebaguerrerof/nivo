import { Check, Clock3, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { activityCategoryOptions, activityStatusLabels } from '@/features/planning/planning.constants'
import { getActivityTime } from '@/features/planning/planning.utils'
import { cn } from '@/lib/utils'
import type { Activity } from '@/types/planning'

interface ActivityCardProps {
  activity: Activity
  isPending?: boolean
  onDelete: () => void
  onEdit: () => void
  onReschedule: () => void
  onToggle: () => void
  timezone: string
}

export function ActivityCard({ activity, isPending = false, onDelete, onEdit, onReschedule, onToggle, timezone }: ActivityCardProps) {
  const category = activityCategoryOptions.find((option) => option.value === activity.category)?.label ?? activity.category
  const startTime = getActivityTime(activity.start_at, timezone)
  const endTime = getActivityTime(activity.end_at, timezone)
  const completed = activity.status === 'completed'

  return (
    <article className={cn('group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition', completed && 'activity-complete border-teal-200/80 bg-teal-50/35 dark:border-teal-900/70 dark:bg-teal-950/20')}>
      <div className="flex items-start gap-3">
        <button aria-label={completed ? `Marcar ${activity.title} como pendiente` : `Completar ${activity.title}`} className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border transition active:scale-90', completed ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border)] text-transparent hover:border-teal-600')} disabled={isPending} onClick={onToggle} type="button"><Check aria-hidden="true" className="size-4" /></button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('truncate text-[15px] font-semibold text-[var(--foreground)]', completed && 'text-[var(--foreground-muted)] line-through')}>{activity.title}</h3>
            {activity.priority === 'high' ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Alta</span> : null}
          </div>
          {activity.description ? <p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{activity.description}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--foreground-subtle)]">
            {startTime ? <span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{startTime}{endTime ? ` – ${endTime}` : ''}</span> : <span>Sin horario</span>}
            <span>{category}</span>
            {!completed && activity.status !== 'pending' ? <span>{activityStatusLabels[activity.status]}</span> : null}
          </div>
        </div>
        <details className="shrink-0">
          <summary aria-label={`Acciones para ${activity.title}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-[var(--foreground-subtle)] hover:bg-[var(--surface-muted)] marker:hidden"><MoreHorizontal aria-hidden="true" className="size-5" /></summary>
          <div className="absolute right-3 top-12 z-10 grid min-w-36 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
            <button className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-left text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]" onClick={onEdit} type="button"><Pencil aria-hidden="true" className="size-3.5" />Editar</button>
            <button className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-left text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]" onClick={onReschedule} type="button"><RotateCcw aria-hidden="true" className="size-3.5" />Reprogramar</button>
            <button className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-left text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/50" onClick={onDelete} type="button"><Trash2 aria-hidden="true" className="size-3.5" />Eliminar</button>
          </div>
        </details>
      </div>
    </article>
  )
}
