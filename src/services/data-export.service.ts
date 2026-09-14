import { getSupabaseClient } from '@/lib/supabase/client'

const exportQueries = {
  profile: (userId: string) => getSupabaseClient().from('profiles').select('first_name, last_name, avatar_url, currency, timezone, onboarding_interests, notification_preferences, created_at, updated_at').eq('user_id', userId).single(),
  plans: (userId: string) => getSupabaseClient().from('daily_plans').select('*').eq('user_id', userId),
  goals: (userId: string) => getSupabaseClient().from('daily_goals').select('*').eq('user_id', userId),
  activities: (userId: string) => getSupabaseClient().from('activities').select('*').eq('user_id', userId),
  reflections: (userId: string) => getSupabaseClient().from('daily_reflections').select('*').eq('user_id', userId),
  xpEvents: (userId: string) => getSupabaseClient().from('xp_events').select('*').eq('user_id', userId),
  userAchievements: (userId: string) => getSupabaseClient().from('user_achievements').select('*').eq('user_id', userId),
  categories: (userId: string) => getSupabaseClient().from('financial_categories').select('*').eq('user_id', userId),
  transactions: (userId: string) => getSupabaseClient().from('financial_transactions').select('*').eq('user_id', userId),
  monthlyBudgets: (userId: string) => getSupabaseClient().from('monthly_budgets').select('*').eq('user_id', userId),
  categoryBudgets: (userId: string) => getSupabaseClient().from('category_budgets').select('*').eq('user_id', userId),
  recurringPayments: (userId: string) => getSupabaseClient().from('recurring_payments').select('*').eq('user_id', userId),
  paymentOccurrences: (userId: string) => getSupabaseClient().from('payment_occurrences').select('*').eq('user_id', userId),
}

export async function exportOwnData(userId: string) {
  const entries = Object.entries(exportQueries)
  const results = await Promise.all(entries.map(async ([key, query]) => {
    const result = await query(userId)
    if (result.error) throw result.error
    return [key, result.data] as const
  }))
  const data = Object.fromEntries(results)
  return {
    exportedAt: new Date().toISOString(),
    format: 'nivo-export-v1',
    data,
  }
}

export async function downloadOwnData(userId: string) {
  const payload = await exportOwnData(userId)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `nivo-datos-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}