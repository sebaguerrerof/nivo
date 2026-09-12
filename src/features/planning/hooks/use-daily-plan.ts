import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activityService } from '@/services/activity.service'
import { planningService } from '@/services/planning.service'
import { dailyPlanKeys } from '@/features/planning/planning.keys'
import { getToggledActivityStatus } from '@/features/planning/planning.utils'
import type { Activity, ActivityInput, DailyGoal, DailyPlanBundle, DailyPlanInput, GoalInput, ReflectionInput } from '@/types/planning'

interface PlanningScope {
  userId: string
  date: string
}

function invalidatePlan(queryClient: ReturnType<typeof useQueryClient>, scope: PlanningScope) {
  return queryClient.invalidateQueries({ queryKey: dailyPlanKeys.byDate(scope.userId, scope.date) })
}

export function useDailyPlan(scope: PlanningScope) {
  return useQuery({
    queryKey: dailyPlanKeys.byDate(scope.userId, scope.date),
    queryFn: () => planningService.getDailyPlanBundle(scope.userId, scope.date),
    enabled: Boolean(scope.userId && scope.date),
  })
}

export function useCreateDailyPlan(scope: PlanningScope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DailyPlanInput) => planningService.createDailyPlan(scope.userId, input),
    onSuccess: (_plan, input) => queryClient.invalidateQueries({ queryKey: dailyPlanKeys.byDate(scope.userId, input.date) }),
  })
}

export function useUpdateDailyPlan(scope: PlanningScope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: DailyPlanInput }) => planningService.updateDailyPlan(scope.userId, planId, input),
    onSuccess: (_plan, variables) => Promise.all([invalidatePlan(queryClient, scope), queryClient.invalidateQueries({ queryKey: dailyPlanKeys.byDate(scope.userId, variables.input.date) })]),
  })
}

export function useCreateGoal(scope: PlanningScope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: GoalInput }) => planningService.createGoal(scope.userId, planId, input),
    onSuccess: () => invalidatePlan(queryClient, scope),
  })
}

export function useGoalActions(scope: PlanningScope) {
  const queryClient = useQueryClient()
  const refresh = () => invalidatePlan(queryClient, scope)

  const toggle = useMutation({ mutationFn: (goal: DailyGoal) => planningService.toggleGoal(scope.userId, goal), onSuccess: refresh })
  const update = useMutation({ mutationFn: ({ goalId, input }: { goalId: string; input: Partial<GoalInput> }) => planningService.updateGoal(scope.userId, goalId, input), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (goalId: string) => planningService.deleteGoal(scope.userId, goalId), onSuccess: refresh })
  const reorder = useMutation({ mutationFn: ({ first, second }: { first: DailyGoal; second: DailyGoal }) => planningService.reorderGoals(scope.userId, first, second), onSuccess: refresh })

  return { toggle, update, remove, reorder }
}

export function useCreateActivity(scope: PlanningScope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: ActivityInput }) => activityService.createActivity(scope.userId, planId, input),
    onSuccess: () => invalidatePlan(queryClient, scope),
  })
}

export function useActivityActions(scope: PlanningScope) {
  const queryClient = useQueryClient()
  const key = dailyPlanKeys.byDate(scope.userId, scope.date)
  const refresh = () => queryClient.invalidateQueries({ queryKey: key })

  const toggle = useMutation({
    mutationFn: (activity: Activity) => activityService.setActivityStatus(scope.userId, activity.id, getToggledActivityStatus(activity.status)),
    onMutate: async (activity) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<DailyPlanBundle | null>(key)
      queryClient.setQueryData<DailyPlanBundle | null>(key, (bundle) =>
        bundle
          ? {
              ...bundle,
              activities: bundle.activities.map((item) =>
                item.id === activity.id
                  ? { ...item, status: getToggledActivityStatus(item.status), updated_at: new Date().toISOString() }
                  : item,
              ),
            }
          : bundle,
      )
      return { previous }
    },
    onError: (_error, _activity, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: refresh,
  })
  const update = useMutation({ mutationFn: ({ activityId, input }: { activityId: string; input: Partial<ActivityInput> }) => activityService.updateActivity(scope.userId, activityId, input), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (activityId: string) => activityService.deleteActivity(scope.userId, activityId), onSuccess: refresh })
  const reschedule = useMutation({ mutationFn: ({ activityId, startAt, endAt }: { activityId: string; startAt: string | null; endAt: string | null }) => activityService.rescheduleActivity(scope.userId, activityId, startAt, endAt), onSuccess: refresh })

  return { toggle, update, remove, reschedule }
}

export function useCloseDay(scope: PlanningScope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: ReflectionInput }) => planningService.closeDay(scope.userId, planId, input),
    onSuccess: () => invalidatePlan(queryClient, scope),
  })
}
