import { IonContent, IonPage } from '@ionic/react'
import { useEffect, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DailyPlanSetup } from '@/features/planning/components/daily-plan-setup'
import { DailyReportComposer } from '@/features/planning/components/daily-report-composer'
import { PlanFromText } from '@/features/planning/components/plan-from-text'
import { DailyTimeline } from '@/features/planning/components/daily-timeline'
import { ActivityForm } from '@/features/planning/components/activity-form'
import { GoalsSection } from '@/features/planning/components/goals-section'
import { PlanDetailsForm } from '@/features/planning/components/plan-details-form'
import { PlanningSkeleton } from '@/features/planning/components/planning-skeleton'
import { ProgressCard } from '@/features/planning/components/progress-card'
import { ReflectionForm } from '@/features/planning/components/reflection-form'
import { DailyScoreCard } from '@/features/gamification/components/daily-score-card'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'
import { toDailyPlanDraftInput } from '@/features/planning/plan-draft.utils'
import { getDateFromPlanSearch, getTodayInTimeZone, formatPlanDate } from '@/features/planning/planning.utils'
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

  useEffect(() => {
    const requestedDate = getDateFromPlanSearch(location.search)
    if (requestedDate) setSelectedDate(requestedDate)
  }, [location.search])
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

  useEffect(() => {
    if (new URLSearchParams(location.search).get('quick') === 'activity' && plan && !plan.closed_at) {
      setActiveActivity(undefined)
      setActivityMode('create')
    }
  }, [location.search, plan])
  const canFillEmptyPlanWithDraft = Boolean(
    plan
    && !plan.closed_at
    && bundle?.goals.length === 0
    && bundle.activities.length === 0
    && !plan.wake_up_time
    && !plan.recovery_activity
    && !plan.responsibilities
    && !plan.family_connection
    && !plan.main_risk
    && !plan.risk_strategy
    && !plan.daily_commitment
    && !plan.notes,
  )
  const isWorking = createPlan.isPending || createPlanWithContent.isPending || fillEmptyPlanWithContent.isPending || updatePlan.isPending || createGoal.isPending || goalActions.toggle.isPending || goalActions.update.isPending || goalActions.remove.isPending || goalActions.reorder.isPending || createActivity.isPending || activityActions.toggle.isPending || activityActions.complete.isPending || activityActions.skip.isPending || activityActions.resetOutcome.isPending || activityActions.update.isPending || activityActions.remove.isPending || activityActions.reschedule.isPending || closeDay.isPending

  const createDailyPlan = async (input: DailyPlanInput) => {
    setFeedback(null)
    try {
      await createPlan.mutateAsync(input)
      setSelectedDate(input.date)
    } catch {
      setFeedback('No pudimos crear tu día. Si ya existe un plan para esta fecha, ábrelo desde el selector.')
      throw new Error('No pudimos crear tu día.')
    }
  }

  const generatePlanDraft = (prompt: string) => planDraftService.generate({ prompt, date: selectedDate, timezone })

  const createPlanFromDraft = async (draft: PlanDraft) => {
    setFeedback(null)
    try {
      const input = toDailyPlanDraftInput(draft, timezone)
      await createPlanWithContent.mutateAsync(input)
      setSelectedDate(input.plan.date)
    } catch {
      setFeedback('No pudimos guardar este plan. Si ya existe un plan para esta fecha, ábrelo desde el selector.')
      throw new Error('No pudimos guardar este plan.')
    }
  }

  const fillEmptyPlanFromDraft = async (draft: PlanDraft) => {
    if (!plan) return
    setFeedback(null)
    try {
      await fillEmptyPlanWithContent.mutateAsync({ planId: plan.id, input: toDailyPlanDraftInput(draft, timezone) })
    } catch {
      setFeedback('No pudimos completar este día con el borrador. Intenta nuevamente.')
      throw new Error('No pudimos completar este día con el borrador.')
    }
  }
  const deleteCurrentPlan = async () => {
    if (!plan) return
    setFeedback(null)
    try {
      await deletePlan.mutateAsync(plan.id)
      setActivityMode(null)
      setActiveActivity(undefined)
      setFeedback('Eliminaste este día. Ahora puedes crearlo nuevamente.')
    } catch {
      setFeedback('No pudimos eliminar este día. Intenta nuevamente.')
      throw new Error('No pudimos eliminar este día.')
    }
  }
  const savePlan = async (input: DailyPlanInput) => {
    if (!plan) return
    setFeedback(null)
    try {
      await updatePlan.mutateAsync({ planId: plan.id, input })
      setSelectedDate(input.date)
    } catch {
      setFeedback('No pudimos actualizar la información del día. Intenta nuevamente.')
      throw new Error('No pudimos actualizar la información del día.')
    }
  }

  const openActivityForm = (mode: Exclude<ActivityMode, null>, activity?: Activity) => {
    setFeedback(null)
    setActiveActivity(activity)
    setActivityMode(mode)
  }

  const saveActivity = async (input: ActivityInput) => {
    if (!plan) return
    setFeedback(null)
    try {
      if (activityMode === 'create') await createActivity.mutateAsync({ planId: plan.id, input })
      if (activityMode === 'edit' && activeActivity) await activityActions.update.mutateAsync({ activityId: activeActivity.id, input })
      if (activityMode === 'reschedule' && activeActivity) await activityActions.reschedule.mutateAsync({ activityId: activeActivity.id, startAt: input.startAt ?? null, endAt: input.endAt ?? null })
      setActivityMode(null)
      setActiveActivity(undefined)
    } catch {
      setFeedback('No pudimos guardar esta actividad. Intenta nuevamente.')
      throw new Error('No pudimos guardar esta actividad.')
    }
  }

  const closeWithReflection = async (input: ReflectionInput) => {
    if (!plan) return
    setFeedback(null)
    try {
      await closeDay.mutateAsync({ planId: plan.id, input })
    } catch {
      setFeedback('No pudimos cerrar tu día. Intenta nuevamente.')
      throw new Error('No pudimos cerrar tu día.')
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mx-auto max-w-6xl">
            <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-[var(--foreground-muted)]">Planificación diaria</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Mi día</h1>
                <p className="mt-2 text-[15px] text-[var(--foreground-muted)]">{formatPlanDate(selectedDate, timezone)}</p>
              </div>
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground-muted)] shadow-sm"><CalendarDays aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-400" /><span className="sr-only">Ver otro día</span><input aria-label="Ver otro día" className="min-w-32 bg-transparent outline-none" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} /></label>
            </header>

            {feedback ? <div className="mb-5"><Alert variant="error">{feedback}</Alert></div> : null}
            {dailyPlan.isLoading ? <PlanningSkeleton /> : null}
            {dailyPlan.isError ? <Alert variant="error">No pudimos cargar tu planificación. Actualiza la página e inténtalo nuevamente.</Alert> : null}
            {!dailyPlan.isLoading && !dailyPlan.isError && !bundle ? <DailyPlanSetup date={selectedDate} isPending={createPlan.isPending} isSavingDraft={createPlanWithContent.isPending} onDateChange={setSelectedDate} onCreate={createDailyPlan} onCreateFromDraft={createPlanFromDraft} onGenerateDraft={generatePlanDraft} timezone={timezone} /> : null}
            {bundle && plan ? <>{canFillEmptyPlanWithDraft ? <div className="mb-5"><PlanFromText date={selectedDate} isSaving={fillEmptyPlanWithContent.isPending} onDateChange={setSelectedDate} onGenerate={generatePlanDraft} onSave={fillEmptyPlanFromDraft} timezone={timezone} /></div> : null}<div className="grid gap-5 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:items-start"><div className="grid gap-5"><DailyScoreCard score={plan.daily_score} /><ProgressCard activities={bundle.activities} /><GoalsSection goals={bundle.goals} isWorking={isWorking} onCreate={async (title, position) => createGoal.mutateAsync({ planId: plan.id, input: { title, position } })} onDelete={async (goalId) => goalActions.remove.mutateAsync(goalId)} onReorder={async (first, second) => goalActions.reorder.mutateAsync({ first, second })} onToggle={async (goal) => goalActions.toggle.mutateAsync(goal)} onUpdate={async (goalId, title) => goalActions.update.mutateAsync({ goalId, input: { title } })} /><PlanDetailsForm isDeleting={deletePlan.isPending} isPending={updatePlan.isPending} onDelete={deleteCurrentPlan} onSave={savePlan} plan={plan} /></div><div className="grid gap-5">{activityMode ? <div><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-bold text-[var(--foreground)]">{activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Editar actividad' : 'Reprogramar actividad'}</h2>{activityMode === 'create' ? <Button onClick={() => setActivityMode(null)} size="sm" variant="ghost">Cerrar</Button> : null}</div><ActivityForm activity={activeActivity} date={selectedDate} isPending={isWorking} onCancel={() => { setActivityMode(null); setActiveActivity(undefined) }} onSubmit={saveActivity} submitLabel={activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Guardar actividad' : 'Guardar nueva hora'} timezone={timezone} /></div> : <Button className="w-full sm:w-auto" onClick={() => openActivityForm('create')} variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar actividad</Button>}<DailyTimeline activities={bundle.activities} isWorking={isWorking} onAdd={() => openActivityForm('create')} onComplete={async (activity) => { try { await activityActions.complete.mutateAsync(activity) } catch { setFeedback('No pudimos marcar esta actividad como realizada. Intenta nuevamente.') } }} onDelete={async (activityId) => { try { await activityActions.remove.mutateAsync(activityId) } catch { setFeedback('No pudimos eliminar esta actividad. Intenta nuevamente.') } }} onEdit={(activity) => openActivityForm('edit', activity)} onMarkNotCompleted={async (activity, reason) => { try { await activityActions.skip.mutateAsync({ activity, reason }) } catch { setFeedback('No pudimos guardar el motivo. Intenta nuevamente.') } }} onReschedule={(activity) => openActivityForm('reschedule', activity)} onResetOutcome={async (activity) => { try { await activityActions.resetOutcome.mutateAsync(activity) } catch { setFeedback('No pudimos corregir el resultado. Intenta nuevamente.') } }} timezone={timezone} /><ReflectionForm isPending={closeDay.isPending} onClose={closeWithReflection} plan={plan} reflection={bundle.reflection} timezone={timezone} />{plan.closed_at ? <DailyReportComposer isSavingNextPlan={createPlanWithContent.isPending} onCreateNextPlan={createPlanFromDraft} plan={plan} timezone={timezone} /> : null}</div></div></> : null}
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}