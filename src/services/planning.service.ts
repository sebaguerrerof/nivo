import { getSupabaseClient } from '@/lib/supabase/client'
import { activityService } from '@/services/activity.service'
import type { DailyGoal, DailyPlan, DailyPlanBundle, DailyPlanDraftInput, DailyPlanInput, DailyReflection, GoalInput, ReflectionInput } from '@/types/planning'

const planColumns = 'id, user_id, date, wake_up_time, recovery_activity, responsibilities, family_connection, main_risk, risk_strategy, daily_commitment, notes, daily_score, closed_at, created_at, updated_at'
const goalColumns = 'id, daily_plan_id, user_id, title, position, completed, completed_at, created_at, updated_at'
const reflectionColumns = 'id, user_id, daily_plan_id, what_went_well, what_to_improve, mood_score, created_at, updated_at'

function toPlanPayload(input: DailyPlanInput) {
  return {
    date: input.date,
    wake_up_time: input.wakeUpTime || null,
    recovery_activity: input.recoveryActivity?.trim() || null,
    responsibilities: input.responsibilities?.trim() || null,
    family_connection: input.familyConnection?.trim() || null,
    main_risk: input.mainRisk?.trim() || null,
    risk_strategy: input.riskStrategy?.trim() || null,
    daily_commitment: input.dailyCommitment?.trim() || null,
    notes: input.notes?.trim() || null,
  }
}

function isEmptyDailyPlan(plan: DailyPlan) {
  return !plan.closed_at
    && !plan.wake_up_time
    && !plan.recovery_activity
    && !plan.responsibilities
    && !plan.family_connection
    && !plan.main_risk
    && !plan.risk_strategy
    && !plan.daily_commitment
    && !plan.notes
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

  async createDailyPlanWithContent(input: DailyPlanDraftInput): Promise<DailyPlan> {
    const plan = toPlanPayload(input.plan)
    const { data, error } = await getSupabaseClient()
      .rpc('create_daily_plan_with_content', {
        p_date: plan.date,
        p_wake_up_time: plan.wake_up_time,
        p_recovery_activity: plan.recovery_activity,
        p_responsibilities: plan.responsibilities,
        p_family_connection: plan.family_connection,
        p_main_risk: plan.main_risk,
        p_risk_strategy: plan.risk_strategy,
        p_daily_commitment: plan.daily_commitment,
        p_notes: plan.notes,
        p_goals: input.goals.map((goal) => ({ title: goal.title.trim() })),
        p_activities: input.activities.map((activity) => ({
          title: activity.title.trim(),
          description: activity.description?.trim() || null,
          category: activity.category,
          start_at: activity.startAt ?? null,
          end_at: activity.endAt ?? null,
          priority: activity.priority,
          status: activity.status ?? 'pending',
        })),
      })
      .single()

    if (error) throw error
    return data as DailyPlan
  },

  async fillEmptyDailyPlanWithContent(planId: string, input: DailyPlanDraftInput): Promise<DailyPlan> {
    const plan = toPlanPayload(input.plan)
    const { data, error } = await getSupabaseClient()
      .rpc('fill_empty_daily_plan_with_content', {
        p_plan_id: planId,
        p_wake_up_time: plan.wake_up_time,
        p_recovery_activity: plan.recovery_activity,
        p_responsibilities: plan.responsibilities,
        p_family_connection: plan.family_connection,
        p_main_risk: plan.main_risk,
        p_risk_strategy: plan.risk_strategy,
        p_daily_commitment: plan.daily_commitment,
        p_notes: plan.notes,
        p_goals: input.goals.map((goal) => ({ title: goal.title.trim() })),
        p_activities: input.activities.map((activity) => ({
          title: activity.title.trim(),
          description: activity.description?.trim() || null,
          category: activity.category,
          start_at: activity.startAt ?? null,
          end_at: activity.endAt ?? null,
          priority: activity.priority,
          status: activity.status ?? 'pending',
        })),
      })
      .single()

    if (error) throw error
    return data as DailyPlan
  },
  async saveDailyPlanWithContent(userId: string, input: DailyPlanDraftInput): Promise<DailyPlan> {
    const existingPlan = await this.getDailyPlan(userId, input.plan.date)
    if (!existingPlan) return this.createDailyPlanWithContent(input)
    if (isEmptyDailyPlan(existingPlan)) return this.fillEmptyDailyPlanWithContent(existingPlan.id, input)

    throw new Error('Ya existe un plan con contenido para esta fecha.')
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

  async deleteDailyPlan(userId: string, planId: string) {
    const { error } = await getSupabaseClient().from('daily_plans').delete().eq('id', planId).eq('user_id', userId)
    if (error) throw error
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