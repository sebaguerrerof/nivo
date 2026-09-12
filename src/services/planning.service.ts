import { getSupabaseClient } from '@/lib/supabase/client'
import { activityService } from '@/services/activity.service'
import type { DailyGoal, DailyPlan, DailyPlanBundle, DailyPlanInput, DailyReflection, GoalInput, ReflectionInput } from '@/types/planning'

const planColumns = 'id, user_id, date, wake_up_time, daily_commitment, notes, closed_at, created_at, updated_at'
const goalColumns = 'id, daily_plan_id, user_id, title, position, completed, completed_at, created_at, updated_at'
const reflectionColumns = 'id, user_id, daily_plan_id, what_went_well, what_to_improve, mood_score, created_at, updated_at'

function toPlanPayload(input: DailyPlanInput) {
  return {
    date: input.date,
    wake_up_time: input.wakeUpTime || null,
    daily_commitment: input.dailyCommitment?.trim() || null,
    notes: input.notes?.trim() || null,
  }
}

export const planningService = {
  async getDailyPlan(userId: string, date: string): Promise<DailyPlan | null> {
    const { data, error } = await getSupabaseClient().from('daily_plans').select(planColumns).eq('user_id', userId).eq('date', date).maybeSingle()
    if (error) throw error
    return data as DailyPlan | null
  },

  async getDailyPlanBundle(userId: string, date: string): Promise<DailyPlanBundle | null> {
    const plan = await this.getDailyPlan(userId, date)
    if (!plan) return null

    const [goals, activities, reflection] = await Promise.all([this.getGoals(plan.id), activityService.getActivities(plan.id), this.getReflection(plan.id)])
    return { plan, goals, activities, reflection }
  },

  async createDailyPlan(userId: string, input: DailyPlanInput): Promise<DailyPlan> {
    const { data, error } = await getSupabaseClient()
      .from('daily_plans')
      .insert({ user_id: userId, ...toPlanPayload(input) })
      .select(planColumns)
      .single()

    if (error) throw error
    return data as DailyPlan
  },

  async updateDailyPlan(userId: string, planId: string, input: DailyPlanInput): Promise<DailyPlan> {
    const { data, error } = await getSupabaseClient()
      .from('daily_plans')
      .update(toPlanPayload(input))
      .eq('id', planId)
      .eq('user_id', userId)
      .select(planColumns)
      .single()

    if (error) throw error
    return data as DailyPlan
  },

  async getGoals(planId: string): Promise<DailyGoal[]> {
    const { data, error } = await getSupabaseClient().from('daily_goals').select(goalColumns).eq('daily_plan_id', planId).order('position')
    if (error) throw error
    return data as DailyGoal[]
  },

  async createGoal(userId: string, planId: string, input: GoalInput): Promise<DailyGoal> {
    const { data, error } = await getSupabaseClient()
      .from('daily_goals')
      .insert({ user_id: userId, daily_plan_id: planId, title: input.title.trim(), position: input.position })
      .select(goalColumns)
      .single()

    if (error) throw error
    return data as DailyGoal
  },

  async updateGoal(userId: string, goalId: string, input: Partial<GoalInput>): Promise<DailyGoal> {
    const { data, error } = await getSupabaseClient()
      .from('daily_goals')
      .update({
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select(goalColumns)
      .single()

    if (error) throw error
    return data as DailyGoal
  },

  async deleteGoal(userId: string, goalId: string) {
    const { error } = await getSupabaseClient().from('daily_goals').delete().eq('id', goalId).eq('user_id', userId)
    if (error) throw error
  },

  async toggleGoal(userId: string, goal: DailyGoal): Promise<DailyGoal> {
    const completed = !goal.completed
    const { data, error } = await getSupabaseClient()
      .from('daily_goals')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', goal.id)
      .eq('user_id', userId)
      .select(goalColumns)
      .single()

    if (error) throw error
    return data as DailyGoal
  },

  async reorderGoals(userId: string, first: DailyGoal, second: DailyGoal) {
    await Promise.all([
      this.updateGoal(userId, first.id, { position: second.position }),
      this.updateGoal(userId, second.id, { position: first.position }),
    ])
  },

  async getReflection(planId: string): Promise<DailyReflection | null> {
    const { data, error } = await getSupabaseClient().from('daily_reflections').select(reflectionColumns).eq('daily_plan_id', planId).maybeSingle()
    if (error) throw error
    return data as DailyReflection | null
  },

  async closeDay(userId: string, planId: string, input: ReflectionInput): Promise<DailyReflection> {
    const { data: reflection, error: reflectionError } = await getSupabaseClient()
      .from('daily_reflections')
      .upsert(
        {
          user_id: userId,
          daily_plan_id: planId,
          what_went_well: input.whatWentWell?.trim() || null,
          what_to_improve: input.whatToImprove?.trim() || null,
          mood_score: input.moodScore ?? null,
        },
        { onConflict: 'daily_plan_id' },
      )
      .select(reflectionColumns)
      .single()

    if (reflectionError) throw reflectionError

    const { error: planError } = await getSupabaseClient()
      .from('daily_plans')
      .update({ closed_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', userId)

    if (planError) throw planError
    return reflection as DailyReflection
  },
}
