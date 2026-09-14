import { Flame } from 'lucide-react'
import type { StreakSummary } from '@/types/gamification'

export function StreakIndicator({ streak, mobile = false }: { streak?: StreakSummary; mobile?: boolean }) {
  if (!streak) return <div aria-label="Cargando racha" className="h-8 w-16 animate-pulse rounded-full bg-[var(--surface-subtle)]" />
  return <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 text-xs font-bold text-orange-700 dark:bg-orange-950/45 dark:text-orange-300"><Flame aria-hidden="true" className="size-3.5" />{streak.current}{mobile ? null : <span className="font-medium">{streak.current === 1 ? 'día' : 'días'}</span>}</span>
}