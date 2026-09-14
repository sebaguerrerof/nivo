import { IonContent, IonPage } from '@ionic/react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { MotionReveal } from '@/components/motion/motion-reveal'
import { useAuth } from '@/features/auth/auth-context'
import { DashboardCurrentActivity, DashboardNextActivities } from '@/features/dashboard/dashboard-activity-focus'
import { DashboardDayHero } from '@/features/dashboard/dashboard-day-hero'
import { DashboardGlance } from '@/features/dashboard/dashboard-glance'
import { DashboardGoals } from '@/features/dashboard/dashboard-goals'
import { getDashboardActivitySnapshot, getGreeting, getLongDate } from '@/features/dashboard/dashboard.utils'
import { getCurrentFinanceMonth } from '@/features/finances/finance.utils'
import { useGamificationSummary } from '@/features/gamification/hooks/use-gamification'
import { useFinancialOverview } from '@/features/finances/hooks/use-finances'
import { MarkPaymentSheet } from '@/features/payments/components/mark-payment-sheet'
import { usePaymentActions, useUpcomingPayments } from '@/features/payments/hooks/use-payments'
import { getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { useActivityActions, useDailyPlan, useGoalActions } from '@/features/planning/hooks/use-daily-plan'
import { getDailyProgress, getNextCalendarDate, getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useProfile } from '@/hooks/use-profile'

function paymentPriority(payment: PaymentOccurrence, timezone: string) {
  const status = getPaymentOccurrenceStatus(payment, getTodayInTimeZone(timezone))
  if (status === 'overdue') return 0
  if (status === 'pending') return 1
  return 2
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: profile, isLoading: isLoadingProfile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const currency = profile?.currency || 'CLP'
  const today = getTodayInTimeZone(timezone)
  const tomorrow = getNextCalendarDate(today)
  const scope = useMemo(() => ({ userId: user?.id ?? '', date: today }), [today, user?.id])
  const [now, setNow] = useState(() => new Date())
  const [markingPayment, setMarkingPayment] = useState<PaymentOccurrence | null>(null)
  const plan = useDailyPlan(scope)
  const gamification = useGamificationSummary(user?.id, today)
  const finance = useFinancialOverview(user?.id, getCurrentFinanceMonth(timezone), timezone)
  const upcomingPayments = useUpcomingPayments(user?.id, timezone, 3)
  const goalActions = useGoalActions(scope)
  const activityActions = useActivityActions(scope)
  const paymentActions = usePaymentActions(user?.id ?? '')
  const name = profile?.first_name || user?.user_metadata.first_name || 'ahí'

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const progress = useMemo(() => getDailyProgress(plan.data?.activities ?? []), [plan.data?.activities])
  const activitySnapshot = useMemo(() => getDashboardActivitySnapshot(plan.data?.activities ?? [], now), [now, plan.data?.activities])
  const relevantPayment = useMemo(() => [...(upcomingPayments.data ?? [])].sort((left, right) => paymentPriority(left, timezone) - paymentPriority(right, timezone) || left.due_date.localeCompare(right.due_date))[0], [timezone, upcomingPayments.data])
  const completedGoals = plan.data?.goals.filter((goal) => goal.completed).length ?? 0
  const activityIsWorking = activityActions.complete.isPending && activityActions.complete.variables?.id === activitySnapshot.current?.id

  return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10 lg:pt-10 xl:px-12"><div className="mx-auto max-w-6xl"><header className="mb-8"><p className="text-sm font-medium text-[var(--foreground-muted)]">{getGreeting(now, timezone)}</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.055em] text-[var(--foreground)] sm:text-4xl">{isLoadingProfile ? <span className="inline-block h-9 w-32 animate-pulse rounded-[10px] bg-[var(--surface-subtle)]" /> : name}</h1><p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)]"><CalendarDays aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />{getLongDate(now, timezone)}</p></header>{plan.isError ? <Alert variant="error">No pudimos cargar tu día. Actualiza la página e inténtalo nuevamente.</Alert> : null}{plan.isLoading ? <section aria-label="Cargando tu día" className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)]"><Card className="h-[22rem] animate-pulse bg-[var(--surface-subtle)]" variant="elevated" /><div className="grid gap-5"><div className="h-44 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-subtle)]" /><div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-subtle)]" /></div></section> : null}{!plan.isLoading && !plan.data ? <MotionReveal><Card className="relative overflow-hidden rounded-[var(--radius-hero)] p-6 sm:p-8" variant="elevated"><div aria-hidden="true" className="absolute -right-20 -top-20 size-56 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-950/30" /><div className="relative max-w-xl"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Tu día</p><h2 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-[var(--foreground)]">Tu día todavía no empieza en Nivo.</h2><p className="mt-3 text-[15px] leading-6 text-[var(--foreground-muted)]">Organízalo en menos de un minuto y deja espacio para lo importante.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.98]" to={`/today?date=${today}`}>Crear mi día<ChevronRight aria-hidden="true" className="size-4" /></Link><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]" to={`/today?date=${tomorrow}`}>Planificar mañana<CalendarDays aria-hidden="true" className="size-4" /></Link></div></div></Card></MotionReveal> : null}{plan.data ? <><section className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)] lg:gap-x-10 lg:gap-y-8"><MotionReveal className="lg:col-start-1 lg:row-start-1"><DashboardDayHero completedActivities={progress.completed} completedGoals={completedGoals} date={today} score={plan.data.plan.daily_score} totalActivities={progress.total} totalGoals={plan.data.goals.length} /></MotionReveal><MotionReveal className="lg:col-start-2 lg:row-start-1" delay={0.03}><DashboardCurrentActivity current={activitySnapshot.current} isWorking={activityIsWorking} next={activitySnapshot.next} onComplete={(activity) => activityActions.complete.mutateAsync(activity)} timezone={timezone} /></MotionReveal><div className="lg:col-start-1 lg:row-start-2"><DashboardGoals date={today} goals={plan.data.goals} isWorking={goalActions.toggle.isPending} onToggle={(goal) => goalActions.toggle.mutateAsync(goal)} /></div><div className="lg:col-start-2 lg:row-start-2"><DashboardNextActivities following={activitySnapshot.following} next={activitySnapshot.next} timezone={timezone} /></div></section><DashboardGlance currency={currency} finance={finance.data} onMarkPayment={setMarkingPayment} payment={relevantPayment} progress={gamification.data} timezone={timezone} /></> : null}</div></main><MarkPaymentSheet occurrence={markingPayment} onClose={() => setMarkingPayment(null)} onSave={(input) => paymentActions.markPaid.mutateAsync({ occurrenceId: markingPayment?.id ?? '', input })} saving={paymentActions.markPaid.isPending} timezone={timezone} /></IonContent></IonPage>
}