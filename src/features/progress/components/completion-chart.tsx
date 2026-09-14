import { CheckSquare2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CompletionChartProps {
  planned: number
  completed: number
  percentage: number | null
}

export function CompletionChart({ planned, completed, percentage }: CompletionChartProps) {
  return (
    <Card className="p-5 sm:p-6" variant="subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CheckSquare2 aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Cumplimiento de actividades</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{completed} de {planned} actividades completadas.</p></div></div>
        <p className="text-2xl font-bold tracking-[-0.045em] text-[var(--foreground)]">{percentage === null ? '—' : `${percentage}%`}</p>
      </div>
      <div aria-label={`${completed} de ${planned} actividades completadas`} aria-valuemax={planned} aria-valuemin={0} aria-valuenow={completed} className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--surface)]" role="progressbar"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400" style={{ width: `${percentage ?? 0}%` }} /></div>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--foreground-muted)]"><span>{planned} planificadas</span><span>{completed} completadas</span></div>
    </Card>
  )
}