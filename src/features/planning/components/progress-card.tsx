import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getDailyProgress } from '@/features/planning/planning.utils'
import type { Activity } from '@/types/planning'

export function ProgressCard({ activities }: { activities: Activity[] }) {
  const progress = getDailyProgress(activities)

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--foreground-muted)]">Progreso de hoy</p>
          <p className="mt-1 text-3xl font-bold tracking-[-0.05em] text-[var(--foreground)]">{progress.percentage}%</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {progress.completed} de {progress.total} actividades completadas
          </p>
        </div>
        <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </div>
      </div>
      <div aria-label={`${progress.percentage}% del día completado`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress.percentage} className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar">
        <div className="h-full rounded-full bg-teal-600 transition-[width] duration-300" style={{ width: `${progress.percentage}%` }} />
      </div>
    </Card>
  )
}
