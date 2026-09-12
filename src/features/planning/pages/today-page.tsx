import { IonContent, IonPage } from '@ionic/react'
import { useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DailyPlanSetup } from '@/features/planning/components/daily-plan-setup'
import { DailyTimeline } from '@/features/planning/components/daily-timeline'
import { ActivityForm } from '@/features/planning/components/activity-form'
import { GoalsSection } from '@/features/planning/components/goals-section'
import { PlanDetailsForm } from '@/features/planning/components/plan-details-form'
import { PlanningSkeleton } from '@/features/planning/components/planning-skeleton'
import { ProgressCard } from '@/features/planning/components/progress-card'
import { ReflectionForm } from '@/features/planning/components/reflection-form'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone, formatPlanDate } from '@/features/planning/planning.utils'
import { useActivityActions, useCloseDay, useCreateActivity, useCreateDailyPlan, useCreateGoal, useDailyPlan, useGoalActions, useUpdateDailyPlan } from '@/features/planning/hooks/use-daily-plan'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'
import type { Activity, ActivityInput, DailyPlanInput, ReflectionInput } from '@/types/planning'

type ActivityMode = 'create' | 'edit' | 'reschedule' | null

export function TodayPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const [selectedDate, setSelectedDate] = useState(() => getTodayInTimeZone(DEFAULT_TIMEZONE))
  const scope = { userId: user?.id ?? '', date: selectedDate }
  const dailyPlan = useDailyPlan(scope)
  const createPlan = useCreateDailyPlan(scope)
  const updatePlan = useUpdateDailyPlan(scope)
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
  const isWorking = createPlan.isPending || updatePlan.isPending || createGoal.isPending || goalActions.toggle.isPending || goalActions.update.isPending || goalActions.remove.isPending || goalActions.reorder.isPending || createActivity.isPending || activityActions.toggle.isPending || activityActions.update.isPending || activityActions.remove.isPending || activityActions.reschedule.isPending || closeDay.isPending

  const createDailyPlan = async (input: DailyPlanInput) => {
    setFeedback(null)
    try {
      await createPlan.mutateAsync(input)
      setSelectedDate(input.date)
    } catch {
      setFeedback('No pudimos crear tu día. Si ya existe un plan para esta fecha, ábrelo desde el selector.')
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
    }
  }

  const closeWithReflection = async (input: ReflectionInput) => {
    if (!plan) return
    setFeedback(null)
    try {
      await closeDay.mutateAsync({ planId: plan.id, input })
    } catch {
      setFeedback('No pudimos cerrar tu día. Intenta nuevamente.')
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
            {!dailyPlan.isLoading && !dailyPlan.isError && !bundle ? <DailyPlanSetup date={selectedDate} isPending={createPlan.isPending} onCreate={createDailyPlan} /> : null}
            {bundle && plan ? <div className="grid gap-5 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:items-start"><div className="grid gap-5"><ProgressCard activities={bundle.activities} /><GoalsSection goals={bundle.goals} isWorking={isWorking} onCreate={async (title, position) => createGoal.mutateAsync({ planId: plan.id, input: { title, position } })} onDelete={async (goalId) => goalActions.remove.mutateAsync(goalId)} onReorder={async (first, second) => goalActions.reorder.mutateAsync({ first, second })} onToggle={async (goal) => goalActions.toggle.mutateAsync(goal)} onUpdate={async (goalId, title) => goalActions.update.mutateAsync({ goalId, input: { title } })} /><PlanDetailsForm isPending={updatePlan.isPending} onSave={savePlan} plan={plan} /></div><div className="grid gap-5">{activityMode ? <div><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-bold text-[var(--foreground)]">{activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Editar actividad' : 'Reprogramar actividad'}</h2>{activityMode === 'create' ? <Button onClick={() => setActivityMode(null)} size="sm" variant="ghost">Cerrar</Button> : null}</div><ActivityForm activity={activeActivity} date={selectedDate} isPending={isWorking} onCancel={() => { setActivityMode(null); setActiveActivity(undefined) }} onSubmit={saveActivity} submitLabel={activityMode === 'create' ? 'Agregar actividad' : activityMode === 'edit' ? 'Guardar actividad' : 'Guardar nueva hora'} timezone={timezone} /></div> : <Button className="w-full sm:w-auto" onClick={() => openActivityForm('create')} variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar actividad</Button>}<DailyTimeline activities={bundle.activities} isWorking={isWorking} onAdd={() => openActivityForm('create')} onDelete={async (activityId) => { try { await activityActions.remove.mutateAsync(activityId) } catch { setFeedback('No pudimos eliminar esta actividad. Intenta nuevamente.') } }} onEdit={(activity) => openActivityForm('edit', activity)} onReschedule={(activity) => openActivityForm('reschedule', activity)} onToggle={async (activity) => { try { await activityActions.toggle.mutateAsync(activity) } catch { setFeedback('No pudimos actualizar esta actividad. Intenta nuevamente.') } }} timezone={timezone} /><ReflectionForm isPending={closeDay.isPending} onClose={closeWithReflection} plan={plan} reflection={bundle.reflection} timezone={timezone} /></div></div> : null}
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}
