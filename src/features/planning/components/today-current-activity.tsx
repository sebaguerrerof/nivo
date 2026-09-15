import { CheckCircle2, CircleX, Clock3, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { activityOutcomeSchema } from '@/features/planning/planning.schemas'
import { getActivityTime } from '@/features/planning/planning.utils'
import type { Activity } from '@/types/planning'

interface TodayCurrentActivityProps {
  activity: Activity | null
  isWorking: boolean
  nextActivity: Activity | null
  onComplete: (activity: Activity) => Promise<unknown>
  onMarkNotCompleted: (activity: Activity, reason: string) => Promise<unknown>
  timezone: string
}

export function TodayCurrentActivity({ activity, isWorking, nextActivity, onComplete, onMarkNotCompleted, timezone }: TodayCurrentActivityProps) {
  const [showReasonSheet, setShowReasonSheet] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string>()

  useEffect(() => {
    setReason('')
    setReasonError(undefined)
    setShowReasonSheet(false)
  }, [activity?.id])

  const saveReason = async () => {
    if (!activity) return
    const parsed = activityOutcomeSchema.safeParse({ reason })
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message)
      return
    }

    setReasonError(undefined)
    await onMarkNotCompleted(activity, parsed.data.reason)
    setShowReasonSheet(false)
  }

  if (!activity) {
    return (
      <section aria-labelledby="now-title" className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)]/45 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-5" /></div>
          <div>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-200" id="now-title">Ahora</p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[var(--foreground)]">Todo tranquilo por ahora.</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">{nextActivity ? <>Lo siguiente es <strong className="font-semibold text-[var(--foreground)]">{nextActivity.title}</strong>{nextActivity.start_at ? ` a las ${getActivityTime(nextActivity.start_at, timezone)}` : ''}.</> : 'No hay otra actividad con horario. Puedes avanzar a tu propio ritmo.'}</p>
          </div>
        </div>
      </section>
    )
  }

  const startTime = getActivityTime(activity.start_at, timezone)
  const endTime = getActivityTime(activity.end_at, timezone)
  return (
    <>
      <section aria-labelledby="now-title" className="relative overflow-hidden rounded-[var(--radius-card)] border border-teal-200/80 bg-[var(--surface)] p-5 shadow-[0_12px_28px_rgba(13,83,73,0.08)] dark:border-teal-900/70 sm:p-6">
        <div aria-hidden="true" className="absolute -right-8 -top-10 size-32 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-800 dark:text-teal-200"><Clock3 aria-hidden="true" className="size-4" />Ahora</div>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]" id="now-title">{activity.title}</h2>
          {activity.description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">{activity.description}</p> : null}
          <p className="mt-2 text-sm font-medium text-[var(--foreground-muted)]">{startTime}{endTime ? ` – ${endTime}` : ''}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button disabled={isWorking} onClick={() => void onComplete(activity)} type="button"><CheckCircle2 aria-hidden="true" className="size-4" />Realizado</Button>
            <Button disabled={isWorking} onClick={() => setShowReasonSheet(true)} type="button" variant="secondary"><CircleX aria-hidden="true" className="size-4" />No realizado</Button>
          </div>
        </div>
      </section>
      {showReasonSheet ? <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-labelledby={`not-completed-${activity.id}`} aria-modal="true"><button aria-label="Cerrar motivo" className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" onClick={() => setShowReasonSheet(false)} type="button" /><section className="relative w-full rounded-t-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-6"><div><p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Registrar resultado</p><h3 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]" id={`not-completed-${activity.id}`}>¿Por qué no se realizó?</h3><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Un motivo breve te ayuda a cerrar el día con honestidad. Podrás editarlo después.</p></div><div className="mt-5"><Textarea autoFocus disabled={isWorking} error={reasonError} id={`current-reason-${activity.id}`} label="Motivo" maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Ej. Surgió algo imprevisto o no me sentí bien." rows={4} value={reason} /></div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button disabled={isWorking} onClick={() => setShowReasonSheet(false)} type="button" variant="ghost">Cancelar</Button><Button disabled={isWorking} onClick={() => void saveReason()} type="button" variant="danger">Guardar como no realizado</Button></div></section></div> : null}
    </>
  )
}