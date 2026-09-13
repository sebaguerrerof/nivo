import type { LucideIcon } from 'lucide-react'
import { CalendarCheck2, CheckCircle2, Gauge, ListChecks } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getComparison } from '@/features/progress/progress.utils'
import type { ProgressPeriodRange, ProgressSummaryValues } from '@/features/progress/progress.types'

interface SummaryMetricProps {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  delta?: number | null
  deltaSuffix?: string
}

function SummaryMetric({ title, value, detail, icon: Icon, delta, deltaSuffix = 'vs. período anterior' }: SummaryMetricProps) {
  const isPositive = typeof delta === 'number' && delta > 0
  const isNegative = typeof delta === 'number' && delta < 0

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--foreground-muted)]">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.055em] text-[var(--foreground)]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">{detail}</p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Icon aria-hidden="true" className="size-4" /></div>
      </div>
      {delta !== null && delta !== undefined ? <p className={`mt-3 text-xs font-semibold ${isPositive ? 'text-teal-700 dark:text-teal-300' : isNegative ? 'text-rose-700 dark:text-rose-300' : 'text-[var(--foreground-muted)]'}`}>
        {isPositive ? '↑ ' : isNegative ? '↓ ' : ''}{Math.abs(delta)}{deltaSuffix ? ` ${deltaSuffix}` : ''}
      </p> : <p className="mt-3 text-xs text-[var(--foreground-subtle)]">Sin comparación suficiente</p>}
    </Card>
  )
}

interface ProgressSummaryProps {
  current: ProgressSummaryValues
  previous: ProgressSummaryValues
  range: ProgressPeriodRange
}

export function ProgressSummary({ current, previous, range }: ProgressSummaryProps) {
  const scoreDelta = getComparison(current.dailyScoreAverage, previous.dailyScoreAverage, current.plannedDays, previous.plannedDays)
  const completionDelta = getComparison(current.completionPercentage, previous.completionPercentage, current.activitiesPlanned, previous.activitiesPlanned, 5)

  return (
    <section aria-label="Resumen del período" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryMetric delta={scoreDelta} detail="promedio en tus días planificados" icon={Gauge} title="Daily Score promedio" value={current.dailyScoreAverage === null ? '—' : String(current.dailyScoreAverage)} />
      <SummaryMetric delta={completionDelta} deltaSuffix="puntos vs. período anterior" detail={`${current.activitiesCompleted} de ${current.activitiesPlanned} actividades`} icon={CheckCircle2} title="Cumplimiento" value={current.completionPercentage === null ? '—' : `${current.completionPercentage}%`} />
      <SummaryMetric detail={`${current.plannedDays} de ${range.period} días del período`} icon={ListChecks} title="Días planificados" value={`${current.plannedDays} / ${range.period}`} />
      <SummaryMetric detail="días cerrados con reflexión" icon={CalendarCheck2} title="Días cerrados" value={String(current.closedDays)} />
    </section>
  )
}