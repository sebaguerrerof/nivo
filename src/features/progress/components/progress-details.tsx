import { ChevronDown } from 'lucide-react'
import { MoodTrendChart } from '@/features/progress/components/mood-trend-chart'
import { WeekdayPerformance } from '@/features/progress/components/weekday-performance'
import { XpChart } from '@/features/progress/components/xp-chart'
import type { MoodPoint, WeekdayStat, XpTimelinePoint } from '@/features/progress/progress.types'

interface ProgressDetailsProps {
  mood: MoodPoint[]
  weekdays: WeekdayStat[]
  xpTimeline: XpTimelinePoint[]
  xpTotal: number
}

export function ProgressDetails({ mood, weekdays, xpTimeline, xpTotal }: ProgressDetailsProps) {
  return (
    <details className="group border-t border-[var(--border-subtle)] pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[var(--radius-control)] py-2 text-left outline-none transition hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)] dark:hover:text-teal-300"><span><span className="block text-base font-bold tracking-[-0.02em] text-[var(--foreground)]">Ver detalles</span><span className="mt-1 block text-sm text-[var(--foreground-muted)]">XP, desempeño por día y ánimo registrado.</span></span><ChevronDown aria-hidden="true" className="size-5 shrink-0 text-[var(--foreground-muted)] transition-transform duration-200 group-open:rotate-180" /></summary>
      <div className="mt-6 grid gap-5 xl:grid-cols-2"><XpChart points={xpTimeline} total={xpTotal} /><WeekdayPerformance weekdays={weekdays} /><div className="xl:col-span-2"><MoodTrendChart points={mood} /></div></div>
    </details>
  )
}