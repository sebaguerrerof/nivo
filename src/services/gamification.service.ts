import { calculateLevel, calculatePlanningStreak } from '@/features/gamification/gamification.utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Achievement, GamificationSummary, UserAchievement } from '@/types/gamification'

const achievementColumns = 'id, user_id, achievement_id, unlocked_at, achievement:achievements(id, code, name, description, icon, xp_bonus)'

function toUserAchievement(value: unknown): UserAchievement | null {
  const item = value as { id?: string; user_id?: string; achievement_id?: string; unlocked_at?: string; achievement?: Achievement | Achievement[] | null }
  const achievement = Array.isArray(item.achievement) ? item.achievement[0] : item.achievement

  if (!item.id || !item.user_id || !item.achievement_id || !item.unlocked_at || !achievement) return null
  return { id: item.id, user_id: item.user_id, achievement_id: item.achievement_id, unlocked_at: item.unlocked_at, achievement }
}

export const gamificationService = {
  async getSummary(userId: string, today: string): Promise<GamificationSummary> {
    const client = getSupabaseClient()
    const [eventsResult, plansResult, achievementsResult] = await Promise.all([
      client.from('xp_events').select('xp').eq('user_id', userId),
      client.from('daily_plans').select('date').eq('user_id', userId).lte('date', today),
      client.from('user_achievements').select(achievementColumns).eq('user_id', userId).order('unlocked_at', { ascending: false }),
    ])

    if (eventsResult.error) throw eventsResult.error
    if (plansResult.error) throw plansResult.error
    if (achievementsResult.error) throw achievementsResult.error

    const totalXp = (eventsResult.data ?? []).reduce((total, event) => total + Number(event.xp ?? 0), 0)
    const achievements = (achievementsResult.data ?? []).map(toUserAchievement).filter((achievement): achievement is UserAchievement => achievement !== null)

    return {
      totalXp,
      level: calculateLevel(totalXp),
      streak: calculatePlanningStreak((plansResult.data ?? []).map((plan) => plan.date), today),
      achievements,
    }
  },
}
