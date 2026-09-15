import { CheckCircle2, ListChecks, Sparkles, Target } from 'lucide-react'
import { getDailyProgress } from '@/features/planning/planning.utils'
import type { Activity, DailyGoal, DailyPlan } from '@/types/planning'

interface TodayDayHeroProps {
  activities: Activity[]
  goals: DailyGoal[]
  plan: DailyPlan
}

export function TodayDayHero({ activities, goals, plan }: TodayDayHeroProps) {
  const progress = getDailyProgress(activities)
  const completedGoals = goals.filter((goal) => goal.completed).length

  return (
    <section aria-labelledby="day-progress-title" className="relative overflow-hidden rounded-[var(--radius-card)] border border-teal-200/75 bg-gradient-to-br from-teal-50 via-[var(--surface)] to-amber-50/55 p-5 shadow-[0_14px_35px_rgba(13,83,73,0.08)] dark:border-teal-900/70 dark:from-teal-950/35 dark:via-[var(--surface)] dark:to-amber-950/15 sm:p-6">
      <div aria-hidden="true" className="absolute -right-12 -top-20 size-48 rounded-full bg-teal-200/35 blur-3xl dark:bg-teal-500/10" />
      <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-800 dark:text-teal-200"><Sparkles aria-hidden="true" className="size-4" />Tu día, en marcha</div>
          <div className="mt-3 flex items-baseline gap-2">
            <strong className="text-4xl font-bold tracking-[-0.06em] text-[var(--foreground)] sm:text-5xl" id="day-progress-title">{progress.percentage}%</strong>
            <span className="text-sm font-medium text-[var(--foreground-muted)]">avance del día</span>
          </div>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">{progress.completed === progress.total && progress.total > 0 ? 'Todo lo que planificaste está listo. Date crédito por el avance.' : 'Lo importante ahora es la siguiente cosa, no hacerlo todo de una vez.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-56">
          <div className="rounded-2xl border border-white/70 bg-white/65 px-3 py-3 backdrop-blur dark:border-white/5 dark:bg-slate-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)]"><CheckCircle2 aria-hidden="true" className="size-3.5 text-teal-700 dark:text-teal-300" />Actividades</div>
            <p className="mt-1 text-lg font-bold text-[var(--foreground)]">{progress.completed}<span className="text-sm text-[var(--foreground-muted)]">/{progress.total}</span></p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/65 px-3 py-3 backdrop-blur dark:border-white/5 dark:bg-slate-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)]"><Target aria-hidden="true" className="size-3.5 text-amber-700 dark:text-amber-300" />Objetivos</div>
            <p className="mt-1 text-lg font-bold text-[var(--foreground)]">{completedGoals}<span className="text-sm text-[var(--foreground-muted)]">/{goals.length}</span></p>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-2xl border border-white/70 bg-white/50 px-3 py-2 text-xs dark:border-white/5 dark:bg-slate-950/15">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--foreground-muted)]"><ListChecks aria-hidden="true" className="size-3.5" />Daily Score</span>
            <strong className="text-sm text-[var(--foreground)]">{plan.daily_score}/100</strong>
          </div>
        </div>
      </div>
    </section>
  )
}