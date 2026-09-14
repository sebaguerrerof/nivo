import { CalendarRange, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MonthlyHeatmap } from '@/features/progress/components/monthly-heatmap'
import type { HeatmapDay, ProgressSummaryValues } from '@/features/progress/progress.types'
import type { StreakSummary } from '@/types/gamification'

interface ConsistencyOverviewProps {
  endDate: string
  heatmap: HeatmapDay[]
  startDate: string
  summary: ProgressSummaryValues
  streak: StreakSummary
}

export function ConsistencyOverview({ endDate, heatmap, startDate, summary, streak }: ConsistencyOverviewProps) {
  return (
    <Card className="p-5 sm:p-7" variant="elevated">
      <div className="flex flex-col gap-6 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CalendarRange aria-hidden="true" className="size-4" /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Constancia</p><h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Tu ritmo en los últimos meses</h2><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Cada bloque resume cómo cerraste ese día.</p></div></div>
        <dl className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] py-3 sm:min-w-[21rem] sm:border-y-0 sm:py-0">
          <div className="px-3 first:pl-0"><dt className="text-[11px] font-medium text-[var(--foreground-subtle)]">Planificados</dt><dd className="mt-1 text-xl font-bold tracking-[-0.04em] text-[var(--foreground)]">{summary.plannedDays}</dd></div>
          <div className="px-3"><dt className="text-[11px] font-medium text-[var(--foreground-subtle)]">Cerrados</dt><dd className="mt-1 text-xl font-bold tracking-[-0.04em] text-[var(--foreground)]">{summary.closedDays}</dd></div>
          <div className="px-3 pr-0"><dt className="flex items-center gap-1 text-[11px] font-medium text-[var(--foreground-subtle)]"><Flame aria-hidden="true" className="size-3 text-amber-600 dark:text-amber-300" />Racha</dt><dd className="mt-1 text-xl font-bold tracking-[-0.04em] text-[var(--foreground)]">{streak.current}</dd></div>
        </dl>
      </div>
      <div className="mt-6"><MonthlyHeatmap endDate={endDate} heatmap={heatmap} startDate={startDate} /></div>
    </Card>
  )
}