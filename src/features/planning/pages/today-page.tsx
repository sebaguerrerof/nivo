import { IonContent, IonPage } from '@ionic/react'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getDashboardActivitySnapshot } from '@/features/dashboard/dashboard.utils'
import { ActivityForm } from '@/features/planning/components/activity-form'
import { DailyPlanSetup } from '@/features/planning/components/daily-plan-setup'
import { DailyReportComposer } from '@/features/planning/components/daily-report-composer'
import { DailyTimeline } from '@/features/planning/components/daily-timeline'
import { GoalsSection } from '@/features/planning/components/goals-section'
import { PlanDetailsForm } from '@/features/planning/components/plan-details-form'
import { PlanFromText } from '@/features/planning/components/plan-from-text'
import { PlanningSkeleton } from '@/features/planning/components/planning-skeleton'
import { ReflectionForm } from '@/features/planning/components/reflection-form'
import { TodayCurrentActivity } from '@/features/planning/components/today-current-activity'
import { TodayDayHero } from '@/features/planning/components/today-day-hero'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'
import { toDailyPlanDraftInput } from '@/features/planning/plan-draft.utils'
import { formatPlanDate, getDateFromPlanSearch, getNextCalendarDate, getPreviousCalendarDate, getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useActivityActions, useCloseDay, useCreateActivity, useCreateDailyPlan, useCreateDailyPlanWithContent, useCreateGoal, useDailyPlan, useDeleteDailyPlan, useFillEmptyDailyPlanWithContent, useGoalActions, useUpdateDailyPlan } from '@/features/planning/hooks/use-daily-plan'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { planDraftService } from '@/services/plan-draft.service'
import type { Activity, ActivityInput, DailyPlanInput, ReflectionInput } from '@/types/planning'

type ActivityMode = 'create' | 'edit' | 'reschedule' | null

export function TodayPage() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const [selectedDate, setSelectedDate] = useState(() => getDateFromPlanSearch(location.search) ?? getTodayInTimeZone(DEFAULT_TIMEZONE))
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const requestedDate = getDateFromPlanSearch(location.search)
    if (requestedDate) setSelectedDate(requestedDate)
  }, [location.search])
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const scope = { userId: user?.id ?? '', date: selectedDate }
  const dailyPlan = useDailyPlan(scope)
  const createPlan = useCreateDailyPlan(scope)
  const createPlanWithContent = useCreateDailyPlanWithContent(scope)
  const updatePlan = useUpdateDailyPlan(scope)
  const deletePlan = useDeleteDailyPlan(scope)
  const fillEmptyPlanWithContent = useFillEmptyDailyPlanWithContent(scope)
  const createGoal = useCreateGoal(scope)
  const goalActions = useGoalActions(scope)
  const createActivity = useCreateActivity(scope)
  const activityActions = useActivityActions(scope)
  const closeDay = useCloseDay(scope)
  const [activityMode, setActivityMode] = useState<ActivityMode>(null)
  const [activeActivity, setActiveActivity] = useState<Activity | undefined>()
  const [feedback, setFeedback] = useState<string | null>(null)
  const bundle = dailyPlan.data
  const plan = bundle?.plan
  const today = getTodayInTimeZone(timezone, now)
  const isToday = selectedDate === today
  const activitySnapshot = useMemo(() => getDashboardActivitySnapshot(bundle?.activities ?? [], now), [bundle?.activities, now])
  const scheduledPendingActivities = useMemo(() => (bundle?.activities ?? []).filter((activity) => activity.status === 'pending' && activity.start_at).sort((first, second) => first.start_at!.localeCompare(second.start_at!)), [bundle?.activities])
  const currentActivity = isToday
    ? activitySnapshot.current ?? scheduledPendingActivities.filter((activity) => activity.start_at && new Date(activity.start_at).getTime() <= now.getTime()).at(-1) ?? null
    : null
  const nextActivity = isToday
    ? scheduledPendingActivities.find((activity) => activity.id !== currentActivity?.id && activity.start_at && new Date(activity.start_at).getTime() > now.getTime()) ?? null
    : scheduledPendingActivities[0] ?? null

  useEffect(() => {
    if (new URLSearchParams(location.search).get('quick') === 'activity' && plan && !plan.closed_at) {
      setActiveActivity(undefined)
      setActivityMode('create')
    }
  }, [location.search, plan])

  const canFillEmptyPlanWithDraft = Boolean(plan && !plan.closed_at && bundle?.goals.length === 0 && bundle.activities.length === 0 && !plan.wake_up_time && !plan.recovery_activity && !plan.responsibilities && !plan.family_connection && !plan.main_risk && !plan.risk_strategy && !plan.daily_commitment && !plan.notes)
  const isWorking = createPlan.isPending || createPlanWithContent.isPending || fillEmptyPlanWithContent.isPending || updatePlan.isPending || createGoal.isPending || goalActions.toggle.isPending || goalActions.update.isPending || goalActions.remove.isPending || goalActions.reorder.isPending || createActivity.isPending || activityActions.toggle.isPending || activityActions.complete.isPending || activityActions.skip.isPending || activityActions.resetOutcome.isPending || activityActions.update.isPending || activityActions.remove.isPending || activityActions.reschedule.isPending || closeDay.isPending

  const createDailyPlan = async (input: DailyPlanInput) => {
    setFeedback(null)
    try { await createPlan.mutateAsync(input); setSelectedDate(input.date) } catch { setFeedback('No pudimos crear tu día. Si ya existe un plan para esta fecha, ábrelo desde el selector.'); throw new Error('No pudimos crear tu día.') }
  }
  const generatePlanDraft = (prompt: string) => planDraftService.generate({ prompt, date: selectedDate, timezone })
  const createPlanFromDraft = async (draft: PlanDraft) => {
    setFeedback(null)
    try { const input = toDailyPlanDraftInput(draft, timezone); await createPlanWithContent.mutateAsync(input); setSelectedDate(input.plan.date) } catch { setFeedback('No pudimos guardar este plan. Si ya existe un plan para esta fecha, ábrelo desde el selector.'); throw new Error('No pudimos guardar este plan.') }
  }
  const fillEmptyPlanFromDraft = async (draft: PlanDraft) => {
    if (!plan) return
    setFeedback(null)
    try { await fillEmptyPlanWithContent.mutateAsync({ planId: plan.id, input: toDailyPlanDraftInput(draft, timezone) }) } catch { setFeedback('No pudimos completar este día con el borrador. Intenta nuevamente.'); throw new Error('No pudimos completar este día.') }
  }
  const deleteCurrentPlan = async () => {
    if (!plan) return
    setFeedback(null)
    try { await deletePlan.mutateAsync(plan.id); setActivityMode(null); setActiveActivity(undefined); setFeedback('Eliminaste este día. Ahora puedes crearlo nuevamente.') } catch { setFeedback('No pudimos eliminar este día. Intenta nuevamente.'); throw new Error('No pudimos eliminar este día.') }
  }
  const savePlan = async (input: DailyPlanInput) => {
    if (!plan) return
    setFeedback(null)
    try { await updatePlan.mutateAsync({ planId: plan.id, input }); setSelectedDate(input.date) } catch { setFeedback('No pudimos actualizar la información del día. Intenta nuevamente.'); throw new Error('No pudimos actualizar la información del día.') }
  }
  const openActivityForm = (mode: Exclude<ActivityMode, null>, activity?: Activity) => { setFeedback(null); setActiveActivity(activity); setActivityMode(mode) }
  const saveActivity = async (input: ActivityInput) => {
    if (!plan) return
    setFeedback(null)
    try {
      if (activityMode === 'create') await createActivity.mutateAsync({ planId: plan.id, input })
      if (activityMode === 'edit' && activeActivity) await activityActions.update.mutateAsync({ activityId: activeActivity.id, input })
      if (activityMode === 'reschedule' && activeActivity) await activityActions.reschedule.mutateAsync({ activityId: activeActivity.id, startAt: input.startAt ?? null, endAt: input.endAt ?? null })
      setActivityMode(null); setActiveActivity(undefined)
    } catch { setFeedback('No pudimos guardar esta actividad. Intenta nuevamente.'); throw new Error('No pudimos guardar esta actividad.') }
  }
  const closeWithReflection = async (input: ReflectionInput) => {
    if (!plan) return
    setFeedback(null)
    try { await closeDay.mutateAsync({ planId: plan.id, input }) } catch { setFeedback('No pudimos cerrar tu día. Intenta nuevamente.'); throw new Error('No pudimos cerrar tu día.') }
  }
  const completeActivity = async (activity: Activity) => { try { await activityActions.complete.mutateAsync(activity) } catch { setFeedback('No pudimos marcar esta actividad como realizada. Intenta nuevamente.') } }
  const markNotCompleted = async (activity: Activity, reason: string) => { try { await activityActions.skip.mutateAsync({ activity, reason }) } catch { setFeedback('No pudimos guardar el motivo. Intenta nuevamente.') } }
  const resetOutcome = async (activity: Activity) => { try { await activityActions.resetOutcome.mutateAsync(activity) } catch { setFeedback('No pudimos corregir el resultado. Intenta nuevamente.') } }
  const deleteActivity = async (activityId: string) => { try { await activityActions.remove.mutateAsync(activityId) } catch { setFeedback('No pudimos eliminar esta actividad. Intenta nuevamente.') } }
  const selectDate = (date: string) => { setActivityMode(null); setActiveActivity(undefined); setSelectedDate(date) }

  return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-6xl"><header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[var(--foreground-muted)]">Planificación diaria</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">{isToday ? 'Hoy' : formatPlanDate(selectedDate, timezone)}</h1><p className="mt-2 text-[15px] text-[var(--foreground-muted)]">{isToday ? formatPlanDate(selectedDate, timezone) : 'Tu día, a tu ritmo.'}</p></div><div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-sm"><Button aria-label="Ver día anterior" onClick={() => selectDate(getPreviousCalendarDate(selectedDate))} size="icon" type="button" variant="ghost"><ChevronLeft aria-hidden="true" className="size-4" /></Button><label className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[var(--foreground-muted)]"><CalendarDays aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-400" /><span className="sr-only">Ver otro día</span><input aria-label="Ver otro día" className="min-w-28 bg-transparent text-sm outline-none" onChange={(event) => selectDate(event.target.value)} type="date" value={selectedDate} /></label><Button aria-label="Ver día siguiente" onClick={() => selectDate(getNextCalendarDate(selectedDate))} size="icon" type="button" variant="ghost"><ChevronRight aria-hidden="true" className="size-4" /></Button></div></header>{feedback ? <div className="mb-5"><Alert variant="error">{feedback}</Alert></div> : null}{dailyPlan.isLoading ? <PlanningSkeleton /> : null}{dailyPlan.isError ? <Alert variant="error">No pudimos cargar tu planificación. Actualiza la página e inténtalo nuevamente.</Alert> : null}{!dailyPlan.isLoading && !dailyPlan.isError && !bundle ? <DailyPlanSetup date={selectedDate} isPending={createPlan.isPending} isSavingDraft={createPlanWithContent.isPending} onDateChange={selectDate} onCreate={createDailyPlan} onCreateFromDraft={createPlanFromDraft} onGenerateDraft={generatePlanDraft} timezone={timezone} /> : null}{bundle && plan ? <><TodayDayHero activities={bundle.activities} goals={bundle.goals} plan={plan} />{canFillEmptyPlanWithDraft ? <details className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--foreground)] marker:hidden"><Sparkles aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />Planificar con IA <span className="font-normal text-[var(--foreground-muted)]">(opcional)</span></summary><div className="mt-4"><PlanFromText date={selectedDate} isSaving={fillEmptyPlanWithContent.isPending} onDateChange={selectDate} onGenerate={generatePlanDraft} onSave={fillEmptyPlanFromDraft} timezone={timezone} /></div></details> : null}<div className="mt-7 grid gap-8 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-10"><div className="grid content-start gap-7"><GoalsSection goals={bundle.goals} isWorking={isWorking} onCreate={async (title, position) => createGoal.mutateAsync({ planId: plan.id, input: { title, position } })} onDelete={async (goalId) => goalActions.remove.mutateAsync(goalId)} onReorder={async (first, second) => goalActions.reorder.mutateAsync({ first, second })} onToggle={async (goal) => goalActions.toggle.mutateAsync(goal)} onUpdate={async (goalId, title) => goalActions.update.mutateAsync({ goalId, input: { title } })} /><PlanDetailsForm isDeleting={deletePlan.isPending} isPending={updatePlan.isPending} onDelete={deleteCurrentPlan} onSave={savePlan} plan={plan} /></div><div className="grid content-start gap-7"><TodayCurrentActivity activity={currentActivity} isWorking={isWorking} nextActivity={nextActivity} onComplete={completeActivity} onMarkNotCompleted={markNotCompleted} timezone={timezone} />{activityMode ? <section aria-labelledby="activity-form-title" className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Organizar el día</p><h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]" id="activity-form-title">{activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Editar actividad' : 'Reprogramar actividad'}</h2></div><Button onClick={() => { setActivityMode(null); setActiveActivity(undefined) }} size="sm" type="button" variant="ghost">Cerrar</Button></div><ActivityForm activity={activeActivity} date={selectedDate} isPending={isWorking} onCancel={() => { setActivityMode(null); setActiveActivity(undefined) }} onSubmit={saveActivity} submitLabel={activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Guardar actividad' : 'Guardar nueva hora'} timezone={timezone} /></section> : null}<DailyTimeline activities={bundle.activities} currentActivityId={currentActivity?.id} isWorking={isWorking} now={now} onAdd={() => openActivityForm('create')} onComplete={completeActivity} onDelete={deleteActivity} onEdit={(activity) => openActivityForm('edit', activity)} onMarkNotCompleted={markNotCompleted} onReschedule={(activity) => openActivityForm('reschedule', activity)} onResetOutcome={resetOutcome} selectedDate={selectedDate} timezone={timezone} today={today} /><ReflectionForm isPending={closeDay.isPending} onClose={closeWithReflection} plan={plan} reflection={bundle.reflection} timezone={timezone} />{plan.closed_at ? <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"><summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:hidden">Preparar reporte y plan de mañana</summary><div className="mt-4"><DailyReportComposer isSavingNextPlan={createPlanWithContent.isPending} onCreateNextPlan={createPlanFromDraft} plan={plan} timezone={timezone} /></div></details> : null}</div></div></> : null}</div></main></IonContent></IonPage>
}