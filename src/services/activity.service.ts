import { getSupabaseClient } from '@/lib/supabase/client'
import type { Activity, ActivityInput, ActivityOutcomeInput, ActivityStatus } from '@/types/planning'

const activityColumns = 'id, user_id, daily_plan_id, title, description, category, start_at, end_at, priority, status, completed_at, not_completed_reason, created_at, updated_at'

export const activityService = {
  async getActivities(planId: string): Promise<Activity[]> {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .select(activityColumns)
      .eq('daily_plan_id', planId)
      .order('start_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Activity[]
  },

  async createActivity(userId: string, planId: string, input: ActivityInput): Promise<Activity> {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .insert({
        user_id: userId,
        daily_plan_id: planId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: input.category,
        start_at: input.startAt ?? null,
        end_at: input.endAt ?? null,
        priority: input.priority,
        status: input.status ?? 'pending',
      })
      .select(activityColumns)
      .single()

    if (error) throw error
    return data as Activity
  },

  async updateActivity(userId: string, activityId: string, input: Partial<ActivityInput>): Promise<Activity> {
    const update = {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.startAt !== undefined ? { start_at: input.startAt } : {}),
      ...(input.endAt !== undefined ? { end_at: input.endAt } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    }

    const { data, error } = await getSupabaseClient()
      .from('activities')
      .update(update)
      .eq('id', activityId)
      .eq('user_id', userId)
      .select(activityColumns)
      .single()

    if (error) throw error
    return data as Activity
  },

  async deleteActivity(userId: string, activityId: string) {
    const { error } = await getSupabaseClient().from('activities').delete().eq('id', activityId).eq('user_id', userId)
    if (error) throw error
  },

  async setActivityStatus(userId: string, activityId: string, status: ActivityStatus): Promise<Activity> {
    const completedAt = status === 'completed' ? new Date().toISOString() : null

    const { data, error } = await getSupabaseClient()
      .from('activities')
      .update({ status, completed_at: completedAt, ...(status === 'completed' ? { not_completed_reason: null } : {}) })
      .eq('id', activityId)
      .eq('user_id', userId)
      .select(activityColumns)
      .single()

    if (error) throw error
    return data as Activity
  },

  async setActivityOutcome(userId: string, activityId: string, input: ActivityOutcomeInput): Promise<Activity> {
    const isCompleted = input.status === 'completed'
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .update({
        status: input.status,
        completed_at: isCompleted ? new Date().toISOString() : null,
        not_completed_reason: isCompleted ? null : input.notCompletedReason?.trim() || null,
      })
      .eq('id', activityId)
      .eq('user_id', userId)
      .select(activityColumns)
      .single()

    if (error) throw error
    return data as Activity
  },

  async resetActivityOutcome(userId: string, activityId: string): Promise<Activity> {
    const { data, error } = await getSupabaseClient()
      .from('activities')
      .update({ status: 'pending', completed_at: null, not_completed_reason: null })
      .eq('id', activityId)
      .eq('user_id', userId)
      .select(activityColumns)
      .single()

    if (error) throw error
    return data as Activity
  },

  async rescheduleActivity(userId: string, activityId: string, startAt: string | null, endAt: string | null): Promise<Activity> {
    return this.updateActivity(userId, activityId, { startAt, endAt, status: 'rescheduled' })
  },
}