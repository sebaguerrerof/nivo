import { Sparkles } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { GamificationSummary } from '@/types/gamification'
import { cn } from '@/lib/utils'

interface XpIndicatorProps {
  summary?: GamificationSummary
  mobile?: boolean
}

export function XpIndicator({ summary, mobile = false }: XpIndicatorProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  if (!summary) return <div aria-label="Cargando progreso" className={cn('h-9 animate-pulse rounded-[10px] bg-[var(--surface-subtle)]', mobile ? 'w-20' : 'w-28')} />

  const { level, totalXp, streak } = summary
  const xpToNextLevel = Math.max(0, level.nextLevelXp - totalXp)

  return (
    <div className="relative">
      {open ? <button aria-label="Cerrar detalles de progreso" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} type="button" /> : null}
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'relative z-50 inline-flex min-h-10 items-center gap-2 rounded-[10px] text-left text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600',
          mobile ? 'px-2 text-xs font-semibold' : 'px-2.5',
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Sparkles aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />
        <span className="leading-tight"><span className="block text-xs font-bold">Nv. {level.level}</span>{mobile ? <span className="text-[10px] text-[var(--foreground-muted)]">{streak.current} días</span> : <span className="block text-[10px] font-medium text-[var(--foreground-muted)]">{totalXp.toLocaleString('es-CL')} XP</span>}</span>
      </button>
      {open ? <section aria-label="Detalle de nivel" className={cn('z-50 border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-elevated)]', mobile ? 'fixed inset-x-3 top-15 rounded-[var(--radius-card)]' : 'absolute right-0 top-[calc(100%+0.5rem)] w-72 rounded-[var(--radius-card)]')} id={panelId} role="dialog">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Nivel {level.level}</p><p className="mt-1 text-2xl font-bold tracking-[-0.05em] text-[var(--foreground)]">{totalXp.toLocaleString('es-CL')} XP</p></div><span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-muted)]">{level.progressPercentage}%</span></div>
        <div aria-label={`${level.progressPercentage}% hacia el próximo nivel`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={level.progressPercentage} className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400" style={{ width: `${level.progressPercentage}%` }} /></div>
        <p className="mt-2 text-xs text-[var(--foreground-muted)]">{xpToNextLevel === 0 ? 'Nuevo nivel desbloqueado.' : `${xpToNextLevel.toLocaleString('es-CL')} XP para el nivel ${level.level + 1}.`}</p>
        {mobile ? <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-4 text-sm"><div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-subtle)]">Racha</p><p className="mt-1 font-bold text-[var(--foreground)]">🔥 {streak.current} días</p></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--foreground-subtle)]">Mejor racha</p><p className="mt-1 font-bold text-[var(--foreground)]">{streak.best} días</p></div></div> : null}
      </section> : null}
    </div>
  )
}