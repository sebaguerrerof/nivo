import { Award, LockKeyhole } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatProgressDate } from '@/features/progress/progress.utils'
import type { ProgressAchievement } from '@/features/progress/progress.types'

export function AchievementsGrid({ achievements }: { achievements: ProgressAchievement[] }) {
  const unlocked = achievements.filter((achievement) => achievement.unlockedAt).length

  return (
    <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Award aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Logros</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{unlocked} de {achievements.length} desbloqueados.</p></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{achievements.map((achievement) => { const isUnlocked = Boolean(achievement.unlockedAt); return <div className={`rounded-xl border p-4 ${isUnlocked ? 'border-teal-200 bg-teal-50/60 dark:border-teal-900/60 dark:bg-teal-950/25' : 'border-[var(--border)] bg-[var(--surface-muted)] opacity-75'}`} key={achievement.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[var(--foreground)]">{achievement.name}</p><p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{achievement.description}</p></div>{isUnlocked ? <Award aria-label="Desbloqueado" className="size-5 shrink-0 text-amber-600 dark:text-amber-300" /> : <LockKeyhole aria-label="Bloqueado" className="size-4 shrink-0 text-[var(--foreground-subtle)]" />}</div><p className="mt-3 text-xs font-medium text-[var(--foreground-subtle)]">{isUnlocked && achievement.unlockedAt ? `Desbloqueado el ${formatProgressDate(achievement.unlockedAt.slice(0, 10))}` : 'Aún bloqueado'}</p></div>})}</div></Card>
  )
}