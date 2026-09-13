import { Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { StreakSummary } from '@/types/gamification'

interface StreakCardProps {
  streak: StreakSummary
  activeDaysThisMonth: number
}

export function StreakCard({ streak, activeDaysThisMonth }: StreakCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6"><div className="absolute -right-10 -top-10 size-28 rounded-full bg-orange-100/70 blur-3xl dark:bg-orange-950/30" /><div className="relative flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-orange-700 dark:text-orange-300"><Flame aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Racha</p></div><p className="mt-3 text-4xl font-bold tracking-[-0.06em] text-[var(--foreground)]">{streak.current}<span className="ml-1 text-lg text-[var(--foreground-muted)]">días</span></p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Mejor racha: {streak.best} {streak.best === 1 ? 'día' : 'días'}</p></div><div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-right"><p className="text-lg font-bold text-[var(--foreground)]">{activeDaysThisMonth}</p><p className="text-[11px] font-medium text-[var(--foreground-muted)]">días este mes</p></div></div></Card>
  )
}