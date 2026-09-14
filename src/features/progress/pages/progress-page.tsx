import { IonContent, IonPage } from '@ionic/react'
import { useMemo, useState } from 'react'
import { ChevronRight, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { AchievementsGrid } from '@/features/progress/components/achievements-grid'
import { CategoryProgress } from '@/features/progress/components/category-progress'
import { CompletionChart } from '@/features/progress/components/completion-chart'
import { ConsistencyOverview } from '@/features/progress/components/consistency-overview'
import { DailyScoreChart } from '@/features/progress/components/daily-score-chart'
import { PeriodSelector } from '@/features/progress/components/period-selector'
import { ProgressDetails } from '@/features/progress/components/progress-details'
import { ProgressHero } from '@/features/progress/components/progress-hero'
import { ProgressInsights } from '@/features/progress/components/progress-insights'
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
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10 lg:pt-10 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[var(--foreground-muted)]">Mirada personal</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.055em] text-[var(--foreground)] sm:text-4xl">Tu progreso</h1><p className="mt-2 text-[15px] text-[var(--foreground-muted)]">Una mirada a tu constancia y avance.</p></div><PeriodSelector onChange={setPeriod} value={period} /></header>
            {analytics.isLoading ? <section aria-label="Cargando tu progreso" className="grid gap-8"><div className="h-[29rem] animate-pulse rounded-[var(--radius-hero)] bg-[var(--surface-subtle)] sm:h-80" /><div className="h-80 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-subtle)]" /></section> : null}
            {data && gamification ? <>{hasData ? <div className="grid gap-10 sm:gap-12"><ProgressHero current={data.summary.current} level={gamification.level} previous={data.summary.previous} streak={gamification.streak} /><ConsistencyOverview endDate={range.endDate} heatmap={data.heatmap} startDate={range.heatmapStartDate} streak={gamification.streak} summary={data.summary.current} /><section className="grid gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)] xl:gap-8"><CompletionChart completed={data.summary.current.activitiesCompleted} percentage={data.summary.current.completionPercentage} planned={data.summary.current.activitiesPlanned} /><DailyScoreChart current={data.summary.current} points={data.dailyScores} previous={data.summary.previous} /></section><CategoryProgress categories={data.categories} /><section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.9fr)] xl:gap-8"><ProgressInsights insights={insights} /><AchievementsGrid achievements={data.gamification.achievements} /></section><ProgressDetails mood={data.mood} weekdays={data.weekdays} xpTimeline={data.xpTimeline} xpTotal={data.summary.current.xpGained} /></div> : <Card className="relative overflow-hidden rounded-[var(--radius-hero)] p-6 sm:p-8" variant="elevated"><div aria-hidden="true" className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" /><div className="relative max-w-xl"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Flame aria-hidden="true" className="size-5" /></div><h2 className="mt-6 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Tu progreso empieza con un día.</h2><p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">Todavía no tenemos suficiente información para mostrar tu progreso. Planifica tu día y vuelve cuando tengas algunos registros.</p><Link className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-teal-700 px-5 text-sm font-semibold text-white no-underline shadow-md shadow-teal-900/15 transition hover:-translate-y-px hover:bg-teal-800 hover:shadow-lg active:translate-y-0 active:scale-[0.985]" to={`/today?date=${today}`}>Planificar mi día<ChevronRight aria-hidden="true" className="size-4" /></Link></div></Card>}</> : null}
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}