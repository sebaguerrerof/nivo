import { Award, Flame, Sparkles } from 'lucide-react'
import { getComparison } from '@/features/progress/progress.utils'
import type { ProgressSummaryValues } from '@/features/progress/progress.types'
import type { LevelProgress, StreakSummary } from '@/types/gamification'

interface ProgressHeroProps {
  current: ProgressSummaryValues
  previous: ProgressSummaryValues
  level: LevelProgress
  streak: StreakSummary
}

function formatDifference(value: number | null) {
  if (value === null) return null
  if (value === 0) return 'Sin cambios frente al período anterior'
  return value > 0 ? `+${value} puntos frente al período anterior` : `${value} puntos frente al período anterior`
}

export function ProgressHero({ current, previous, level, streak }: ProgressHeroProps) {
  const completionDelta = getComparison(
    current.completionPercentage,
    previous.completionPercentage,
    current.activitiesPlanned,
    previous.activitiesPlanned,
    5,
  )
  const xpToNextLevel = Math.max(0, level.nextLevelXp - level.totalXp)

  return (
    <section aria-label="Panorama de progreso" className="relative overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-elevated)] sm:p-8">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-teal-600 dark:bg-teal-400" />
      <div aria-hidden="true" className="absolute -right-20 -top-24 size-64 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-950/25" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)] xl:gap-10">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-4" /><p className="text-[11px] font-bold uppercase tracking-[0.14em]">Tu nivel</p></div>
          <div className="mt-5 flex items-end gap-4">
            <p className="text-5xl font-bold leading-none tracking-[-0.075em] text-[var(--foreground)] sm:text-6xl">Nivel {level.level}</p>
            <span className="mb-0.5 inline-flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Award aria-hidden="true" className="size-5" /></span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]"><strong className="font-semibold text-[var(--foreground)]">{level.totalXp.toLocaleString('es-CL')} XP</strong> acumulados en tu camino.</p>
          <div className="mt-7 max-w-xl">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-medium text-[var(--foreground-muted)]"><span>{xpToNextLevel.toLocaleString('es-CL')} XP para el próximo nivel</span><span>{level.progressPercentage}%</span></div>
            <div aria-label={`${level.progressPercentage}% hacia el próximo nivel`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={level.progressPercentage} className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400" style={{ width: `${level.progressPercentage}%` }} /></div>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--border-subtle)] pt-5 text-sm text-[var(--foreground-muted)]">
            <span className="inline-flex items-center gap-2"><Flame aria-hidden="true" className="size-4 text-amber-600 dark:text-amber-300" /><strong className="font-semibold text-[var(--foreground)]">{streak.current} {streak.current === 1 ? 'día' : 'días'}</strong> de racha actual</span>
            <span>Mejor racha: <strong className="font-semibold text-[var(--foreground)]">{streak.best} {streak.best === 1 ? 'día' : 'días'}</strong></span>
          </div>
        </div>
        <div className="border-t border-[var(--border-subtle)] pt-7 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Cumplimiento del período</p>
          <p className="mt-4 text-5xl font-bold leading-none tracking-[-0.075em] tabular-nums text-[var(--foreground)]">{current.completionPercentage === null ? '—' : `${current.completionPercentage}%`}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]"><strong className="font-semibold text-[var(--foreground)]">{current.activitiesCompleted} de {current.activitiesPlanned}</strong> actividades completadas.</p>
          <div aria-label={`${current.completionPercentage ?? 0}% de cumplimiento`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={current.completionPercentage ?? 0} className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400" style={{ width: `${current.completionPercentage ?? 0}%` }} /></div>
          <p className={`mt-3 text-xs font-semibold ${completionDelta !== null && completionDelta > 0 ? 'text-teal-700 dark:text-teal-300' : completionDelta !== null && completionDelta < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-[var(--foreground-subtle)]'}`}>{formatDifference(completionDelta) ?? 'Registra más actividad para comparar períodos.'}</p>
        </div>
      </div>
    </section>
  )
}