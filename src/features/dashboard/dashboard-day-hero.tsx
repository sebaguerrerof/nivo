import { ArrowRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { dashboardSecondaryActionClassName } from '@/features/dashboard/dashboard.styles'

interface DashboardDayHeroProps {
  date: string
  score: number
  completedActivities: number
  totalActivities: number
  completedGoals: number
  totalGoals: number
}

export function DashboardDayHero({ date, score, completedActivities, totalActivities, completedGoals, totalGoals }: DashboardDayHeroProps) {
  const progress = totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100)

  return <Card className="relative overflow-hidden rounded-[var(--radius-hero)] p-6 sm:p-8" variant="elevated"><div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-teal-600 dark:bg-teal-400" /><div className="relative"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Tu día</p><div className="mt-5 flex items-end gap-3"><p className="text-6xl font-bold leading-none tracking-[-0.08em] text-[var(--foreground)] sm:text-7xl">{score}</p><p className="pb-1 text-sm font-medium text-[var(--foreground-muted)]">Puntaje de hoy<br /><span className="text-xs text-[var(--foreground-subtle)]">de 100</span></p></div><div aria-label={`${progress}% de actividades completadas`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress} className="mt-7 h-2.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-400" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--foreground-muted)]"><span><strong className="font-semibold text-[var(--foreground)]">{completedActivities} de {totalActivities}</strong> actividades</span><span><strong className="font-semibold text-[var(--foreground)]">{completedGoals} de {totalGoals}</strong> objetivos</span></div><div className="mt-7 flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.98]" to={`/today?date=${date}`}>Continuar mi día<ArrowRight aria-hidden="true" className="size-4" /></Link><Link className={dashboardSecondaryActionClassName} to={`/today?date=${date}`}>Ver planificación<CalendarDays aria-hidden="true" className="size-4" /></Link></div></div></Card>
}