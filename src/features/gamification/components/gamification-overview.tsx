import { Award, Flame, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { GamificationSummary } from '@/types/gamification'

interface GamificationOverviewProps {
  summary: GamificationSummary
}

export function GamificationOverview({ summary }: GamificationOverviewProps) {
  const xpToNextLevel = Math.max(0, summary.level.nextLevelXp - summary.totalXp)
  const recentAchievements = summary.achievements.slice(0, 2)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
            <Sparkles aria-hidden="true" className="size-4" />
            <p className="text-sm font-semibold">Tu progreso</p>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[var(--foreground)]">Nivel {summary.level.level}</p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{summary.totalXp.toLocaleString('es-CL')} XP acumulados</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-sm font-bold text-orange-700 dark:bg-orange-950/45 dark:text-orange-300">
          <Flame aria-hidden="true" className="size-4" />
          {summary.streak.current} {summary.streak.current === 1 ? 'día' : 'días'}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between gap-3 text-xs font-medium text-[var(--foreground-muted)]">
          <span>{xpToNextLevel === 0 ? 'Nuevo nivel desbloqueado' : `${xpToNextLevel.toLocaleString('es-CL')} XP para el próximo nivel`}</span>
          <span>{summary.level.progressPercentage}%</span>
        </div>
        <div aria-label={`${summary.level.progressPercentage}% hacia el próximo nivel`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={summary.level.progressPercentage} className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar">
          <div className="h-full rounded-full bg-teal-600 transition-[width] duration-300" style={{ width: `${summary.level.progressPercentage}%` }} />
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]"><Award aria-hidden="true" className="size-4 text-amber-600 dark:text-amber-300" />Logros {summary.achievements.length ? `(${summary.achievements.length})` : ''}</div>
        {recentAchievements.length ? <div className="mt-3 flex flex-wrap gap-2">{recentAchievements.map(({ achievement }) => <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-muted)]" key={achievement.id}>{achievement.name}</span>)}</div> : <p className="mt-2 text-sm text-[var(--foreground-muted)]">Completa una actividad para desbloquear tu primer logro.</p>}
      </div>
    </Card>
  )
}
