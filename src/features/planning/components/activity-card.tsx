import { useEffect, useState } from 'react'
import { CheckCircle2, CircleX, Clock3, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { activityCategoryOptions, activityStatusLabels } from '@/features/planning/planning.constants'
import { activityOutcomeSchema } from '@/features/planning/planning.schemas'
import { getActivityTime } from '@/features/planning/planning.utils'
import { cn } from '@/lib/utils'
import type { Activity } from '@/types/planning'

interface ActivityCardProps {
  activity: Activity
  isPending?: boolean
  onComplete: () => Promise<unknown>
  onDelete: () => void
  onEdit: () => void
  onMarkNotCompleted: (reason: string) => Promise<unknown>
  onReschedule: () => void
  onResetOutcome: () => Promise<unknown>
  timezone: string
}

export function ActivityCard({ activity, isPending = false, onComplete, onDelete, onEdit, onMarkNotCompleted, onReschedule, onResetOutcome, timezone }: ActivityCardProps) {
  const category = activityCategoryOptions.find((option) => option.value === activity.category)?.label ?? activity.category
  const startTime = getActivityTime(activity.start_at, timezone)
  const endTime = getActivityTime(activity.end_at, timezone)
  const completed = activity.status === 'completed'
  const notCompleted = activity.status === 'skipped'
  const [showReasonForm, setShowReasonForm] = useState(false)
  const [reason, setReason] = useState(activity.not_completed_reason ?? '')
  const [reasonError, setReasonError] = useState<string | undefined>()

  useEffect(() => {
    setReason(activity.not_completed_reason ?? '')
    setReasonError(undefined)
  }, [activity.id, activity.not_completed_reason])

  const saveNotCompletedReason = async () => {
    const parsed = activityOutcomeSchema.safeParse({ reason })
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message)
      return
    }

    setReasonError(undefined)
    await onMarkNotCompleted(parsed.data.reason)
    setShowReasonForm(false)
  }

  return (
    <article className={cn('group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition', completed && 'activity-complete border-teal-200/80 bg-teal-50/35 dark:border-teal-900/70 dark:bg-teal-950/20', notCompleted && 'border-rose-200/80 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/15')}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border', completed ? 'border-teal-600 bg-teal-600 text-white' : notCompleted ? 'border-rose-500 bg-rose-500 text-white' : 'border-[var(--border)] text-[var(--foreground-subtle)]')}>
          {completed ? <CheckCircle2 aria-label="Realizado" className="size-4" /> : notCompleted ? <CircleX aria-label="No realizado" className="size-4" /> : <Clock3 aria-hidden="true" className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('truncate text-[15px] font-semibold text-[var(--foreground)]', completed && 'text-[var(--foreground-muted)] line-through')}>{activity.title}</h3>
            {activity.priority === 'high' ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Alta</span> : null}
          </div>
          {activity.description ? <p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{activity.description}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--foreground-subtle)]">
            {startTime ? <span className="inline-flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" />{startTime}{endTime ? ` – ${endTime}` : ''}</span> : <span>Sin horario</span>}
            <span>{category}</span>
            {!completed && activity.status !== 'pending' && !notCompleted ? <span>{activityStatusLabels[activity.status]}</span> : null}
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

      {notCompleted && activity.not_completed_reason ? <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2.5 text-sm leading-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-100"><span className="font-semibold">No se realizó porque: </span>{activity.not_completed_reason}</div> : null}

      {showReasonForm ? <div className="mt-4 grid gap-3 rounded-xl border border-rose-100 bg-rose-50/45 p-3 dark:border-rose-900/60 dark:bg-rose-950/15"><Textarea disabled={isPending} error={reasonError} id={`reason-${activity.id}`} label="¿Por qué no se realizó?" maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Ej. No me sentí bien o surgió algo imprevisto." rows={3} value={reason} /><div className="flex flex-wrap justify-end gap-2"><Button disabled={isPending} onClick={() => setShowReasonForm(false)} size="sm" type="button" variant="ghost">Cancelar</Button><Button loading={isPending} onClick={() => void saveNotCompletedReason()} size="sm" type="button" variant="danger">Guardar motivo</Button></div></div> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {completed ? <><span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-800 dark:bg-teal-950/55 dark:text-teal-200"><CheckCircle2 aria-hidden="true" className="size-3.5" />Realizado</span><Button disabled={isPending} onClick={() => void onResetOutcome()} size="sm" type="button" variant="ghost">Corregir resultado</Button></> : null}
        {notCompleted ? <><span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-800 dark:bg-rose-950/55 dark:text-rose-200"><CircleX aria-hidden="true" className="size-3.5" />No realizado</span><Button disabled={isPending} onClick={() => void onComplete()} size="sm" type="button">Marcar realizado</Button><Button disabled={isPending} onClick={() => setShowReasonForm(true)} size="sm" type="button" variant="ghost">Editar motivo</Button><Button disabled={isPending} onClick={() => void onResetOutcome()} size="sm" type="button" variant="ghost">Volver a pendiente</Button></> : null}
        {!completed && !notCompleted ? <><Button disabled={isPending} onClick={() => void onComplete()} size="sm" type="button"><CheckCircle2 aria-hidden="true" className="size-3.5" />Realizado</Button><Button className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40" disabled={isPending} onClick={() => setShowReasonForm(true)} size="sm" type="button" variant="secondary"><CircleX aria-hidden="true" className="size-3.5" />No realizado</Button></> : null}
      </div>
    </article>
  )
}