import { IonContent, IonPage } from '@ionic/react'
import { useMemo, useState } from 'react'
import { Award, ChevronRight, Flame, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { AchievementsGrid } from '@/features/progress/components/achievements-grid'
import { CategoryProgress } from '@/features/progress/components/category-progress'
import { CompletionChart } from '@/features/progress/components/completion-chart'
import { DailyScoreChart } from '@/features/progress/components/daily-score-chart'
import { MonthlyHeatmap } from '@/features/progress/components/monthly-heatmap'
import { MoodTrendChart } from '@/features/progress/components/mood-trend-chart'
import { PeriodSelector } from '@/features/progress/components/period-selector'
import { ProgressInsights } from '@/features/progress/components/progress-insights'
import { ProgressSummary } from '@/features/progress/components/progress-summary'
import { StreakCard } from '@/features/progress/components/streak-card'
import { WeekdayPerformance } from '@/features/progress/components/weekday-performance'
import { XpChart } from '@/features/progress/components/xp-chart'
import { useProgressAnalytics } from '@/features/progress/hooks/use-progress-analytics'
import { getProgressPeriodRange, buildProgressInsights, hasProgressData } from '@/features/progress/progress.utils'
import type { ProgressPeriod } from '@/features/progress/progress.types'
import { useAuth } from '@/features/auth/auth-context'
import { calculateLevel, calculatePlanningStreak } from '@/features/gamification/gamification.utils'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useProfile } from '@/hooks/use-profile'

export function ProgressPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const today = getTodayInTimeZone(timezone)
  const [period, setPeriod] = useState<ProgressPeriod>(30)
  const range = useMemo(() => getProgressPeriodRange(period, today), [period, today])
  const analytics = useProgressAnalytics({ userId: user?.id ?? '', period, range })

  const gamification = useMemo(() => {
    if (!analytics.data) return null
    return {
      level: calculateLevel(analytics.data.gamification.totalXp),
      streak: calculatePlanningStreak(analytics.data.gamification.planningDates, today),
    }
  }, [analytics.data, today])

  if (analytics.isError) {
    return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-6xl"><Alert variant="error">No pudimos cargar tu progreso. Actualiza la página e inténtalo nuevamente.</Alert></div></main></IonContent></IonPage>
  }

  const data = analytics.data
  const hasData = Boolean(data && hasProgressData(data))
  const insights = data && gamification ? buildProgressInsights(data, gamification.streak) : []

  return (
    <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-6xl">
      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[var(--foreground-muted)]">Mirada personal</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Tu progreso</h1><p className="mt-2 text-[15px] text-[var(--foreground-muted)]">Visualiza tu constancia sin perder de vista lo esencial.</p></div><PeriodSelector onChange={setPeriod} value={period} /></header>
      {analytics.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Card className="h-36 animate-pulse bg-[var(--surface-muted)]" key={index} />)}</div> : null}
      {data && gamification ? <><section aria-label="Nivel y racha" className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]"><Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Tu nivel actual</p></div><p className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[var(--foreground)]">Nivel {gamification.level.level}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{gamification.level.totalXp.toLocaleString('es-CL')} XP acumulados</p></div><div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Award aria-hidden="true" className="size-5" /></div></div><div className="mt-5"><div className="flex justify-between gap-3 text-xs font-medium text-[var(--foreground-muted)]"><span>{Math.max(0, gamification.level.nextLevelXp - gamification.level.totalXp).toLocaleString('es-CL')} XP para el próximo nivel</span><span>{gamification.level.progressPercentage}%</span></div><div aria-label={`${gamification.level.progressPercentage}% hacia el próximo nivel`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={gamification.level.progressPercentage} className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar"><div className="h-full rounded-full bg-[var(--chart-primary)]" style={{ width: `${gamification.level.progressPercentage}%` }} /></div></div></Card><StreakCard activeDaysThisMonth={data.summary.current.activeDaysThisMonth ?? 0} streak={gamification.streak} /></section>
      {hasData ? <><ProgressSummary current={data.summary.current} previous={data.summary.previous} range={range} /><section className="mt-5"><DailyScoreChart points={data.dailyScores} /></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><CompletionChart completed={data.summary.current.activitiesCompleted} percentage={data.summary.current.completionPercentage} planned={data.summary.current.activitiesPlanned} /><CategoryProgress categories={data.categories} /></section><section className="mt-5"><MonthlyHeatmap endDate={range.endDate} heatmap={data.heatmap} startDate={range.heatmapStartDate} /></section><section className="mt-5 grid gap-5 lg:grid-cols-2"><XpChart points={data.xpTimeline} total={data.summary.current.xpGained} /><WeekdayPerformance weekdays={data.weekdays} /></section><section className="mt-5"><MoodTrendChart points={data.mood} /></section><section className="mt-5"><ProgressInsights insights={insights} /></section><section className="mt-5"><AchievementsGrid achievements={data.gamification.achievements} /></section></> : <Card className="relative overflow-hidden p-6 sm:p-8"><div className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" /><div className="relative max-w-xl"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Flame aria-hidden="true" className="size-5" /></div><h2 className="mt-6 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Tu progreso empieza con un día.</h2><p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">Todavía no tenemos suficiente información para mostrar tu progreso. Planifica tu día y vuelve cuando tengas algunos registros.</p><Link className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.98]" to={`/today?date=${today}`}>Planificar mi día<ChevronRight aria-hidden="true" className="size-4" /></Link></div></Card>}</> : null}
    </div></main></IonContent></IonPage>
  )
}