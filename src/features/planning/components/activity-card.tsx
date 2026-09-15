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
  contextLabel?: string
  isPending?: boolean
  onComplete: () => Promise<unknown>
  onDelete: () => void
  onEdit: () => void
  onMarkNotCompleted: (reason: string) => Promise<unknown>
  onReschedule: () => void
  onResetOutcome: () => Promise<unknown>
  timezone: string
}

export function ActivityCard({ activity, contextLabel, isPending = false, onComplete, onDelete, onEdit, onMarkNotCompleted, onReschedule, onResetOutcome, timezone }: ActivityCardProps) {
  const category = activityCategoryOptions.find((option) => option.value === activity.category)?.label ?? activity.category
  const startTime = getActivityTime(activity.start_at, timezone)
  const endTime = getActivityTime(activity.end_at, timezone)
  const completed = activity.status === 'completed'
  const notCompleted = activity.status === 'skipped'
  const [showReasonSheet, setShowReasonSheet] = useState(false)
  const [reason, setReason] = useState(activity.not_completed_reason ?? '')
  const [reasonError, setReasonError] = useState<string>()

  useEffect(() => {
    setReason(activity.not_completed_reason ?? '')
    setReasonError(undefined)
    setShowReasonSheet(false)
  }, [activity.id, activity.not_completed_reason])

  const saveNotCompletedReason = async () => {
    const parsed = activityOutcomeSchema.safeParse({ reason })
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message)
      return
    }

    setReasonError(undefined)
    await onMarkNotCompleted(parsed.data.reason)
    setShowReasonSheet(false)
  }

  const statusText = completed ? 'Realizada' : notCompleted ? 'No realizada' : activity.status === 'pending' ? contextLabel ?? 'Pendiente' : activityStatusLabels[activity.status]

  return (
    <>
      <article className={cn('group min-w-0 border-b border-[var(--border)] py-3.5 last:border-b-0', completed && 'activity-complete', notCompleted && 'opacity-75')}>
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border', completed ? 'border-teal-600 bg-teal-600 text-white' : notCompleted ? 'border-rose-500 bg-rose-500 text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-subtle)]')}>
            {completed ? <CheckCircle2 aria-label="Realizada" className="size-4" /> : notCompleted ? <CircleX aria-label="No realizada" className="size-4" /> : <Clock3 aria-hidden="true" className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn('text-[15px] font-semibold leading-5 text-[var(--foreground)]', completed && 'text-[var(--foreground-muted)] line-through')}>{activity.title}</h3>
              {activity.priority === 'high' ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Alta</span> : null}
            </div>
            {activity.description ? <p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{activity.description}</p> : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--foreground-subtle)]">
              {startTime ? <span>{startTime}{endTime ? ` – ${endTime}` : ''}</span> : <span>Sin horario</span>}
              <span>{category}</span>
              <span className={cn('font-semibold', completed && 'text-teal-700 dark:text-teal-300', notCompleted && 'text-rose-700 dark:text-rose-300')}>{statusText}</span>
            </div>
          </div>
          <details className="relative shrink-0">
            <summary aria-label={`Más acciones para ${activity.title}`} className="grid size-11 cursor-pointer list-none place-items-center rounded-xl text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] marker:hidden"><MoreHorizontal aria-hidden="true" className="size-5" /></summary>
            <div className="absolute right-0 top-11 z-20 grid min-w-40 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
              <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)]" onClick={onEdit} type="button"><Pencil aria-hidden="true" className="size-3.5" />Editar</button>
              <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)]" onClick={onReschedule} type="button"><RotateCcw aria-hidden="true" className="size-3.5" />Reprogramar</button>
              <button className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/50" onClick={onDelete} type="button"><Trash2 aria-hidden="true" className="size-3.5" />Eliminar</button>
            </div>
          </details>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-11">
          {activity.status === 'pending' ? <><Button disabled={isPending} onClick={() => void onComplete()} size="sm" type="button"><CheckCircle2 aria-hidden="true" className="size-3.5" />Realizado</Button><Button disabled={isPending} onClick={() => setShowReasonSheet(true)} size="sm" type="button" variant="ghost"><CircleX aria-hidden="true" className="size-3.5" />No realizado</Button></> : null}
          {completed ? <Button disabled={isPending} onClick={() => void onResetOutcome()} size="sm" type="button" variant="ghost"><RotateCcw aria-hidden="true" className="size-3.5" />Corregir resultado</Button> : null}
          {notCompleted ? <><Button disabled={isPending} onClick={() => void onComplete()} size="sm" type="button" variant="secondary"><CheckCircle2 aria-hidden="true" className="size-3.5" />Marcar realizado</Button><Button disabled={isPending} onClick={() => void onResetOutcome()} size="sm" type="button" variant="ghost">Volver a pendiente</Button></> : null}
        </div>
      </article>
      {showReasonSheet ? <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-labelledby={`activity-reason-title-${activity.id}`} aria-modal="true"><button aria-label="Cerrar motivo" className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" onClick={() => setShowReasonSheet(false)} type="button" /><section className="relative w-full rounded-t-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-6"><p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Registrar resultado</p><h3 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]" id={`activity-reason-title-${activity.id}`}>¿Por qué no se realizó?</h3><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Guarda un motivo breve para tu revisión personal.</p><div className="mt-5"><Textarea autoFocus disabled={isPending} error={reasonError} id={`reason-${activity.id}`} label="Motivo" maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Ej. Surgió algo imprevisto o no me sentí bien." rows={4} value={reason} /></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button disabled={isPending} onClick={() => setShowReasonSheet(false)} type="button" variant="ghost">Cancelar</Button><Button disabled={isPending} onClick={() => void saveNotCompletedReason()} type="button" variant="danger">Guardar como no realizado</Button></div></section></div> : null}
    </>
  )
}