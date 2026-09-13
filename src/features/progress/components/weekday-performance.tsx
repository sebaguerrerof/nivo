import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getWeekdayLabel } from '@/features/progress/progress.utils'
import type { WeekdayStat } from '@/features/progress/progress.types'

export function WeekdayPerformance({ weekdays }: { weekdays: WeekdayStat[] }) {
  const hasData = weekdays.some((weekday) => weekday.planned > 0)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><CalendarDays aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Cumplimiento por día</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Una vista simple de los días que mejor te resultan.</p></div></div>
      {hasData ? <div className="mt-5 grid gap-3">{weekdays.map((weekday) => <div className="grid grid-cols-[5.25rem_minmax(0,1fr)_2.5rem] items-center gap-3" key={weekday.weekday}><span className="text-xs font-medium text-[var(--foreground-muted)]">{getWeekdayLabel(weekday.weekday)}</span><div aria-label={`${getWeekdayLabel(weekday.weekday)}: ${weekday.percentage ?? 0}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={weekday.percentage ?? 0} className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar"><div className="h-full rounded-full bg-[var(--chart-primary)]" style={{ width: `${weekday.percentage ?? 0}%` }} /></div><span className="text-right text-xs font-semibold text-[var(--foreground-muted)]">{weekday.percentage === null ? '—' : `${weekday.percentage}%`}</span></div>)}</div> : <p className="mt-5 text-sm text-[var(--foreground-muted)]">Agrega actividades en distintos días para ver este patrón.</p>}
    </Card>
  )
}