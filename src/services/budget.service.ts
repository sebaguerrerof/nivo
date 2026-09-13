import { getSupabaseClient } from '@/lib/supabase/client'
import type { CategoryBudget, CategoryBudgetInput, MonthlyBudget, MonthlyBudgetInput } from '@/features/finances/finance.types'

const monthlyBudgetColumns = 'id, user_id, year, month, amount, savings_target, created_at, updated_at'
const categoryBudgetColumns = 'id, user_id, monthly_budget_id, category_id, amount, created_at, updated_at'

export const budgetService = {
  async upsertMonthlyBudget(userId: string, input: MonthlyBudgetInput): Promise<MonthlyBudget> {
    const { data, error } = await getSupabaseClient()
      .from('monthly_budgets')
      .upsert(
        {
          user_id: userId,
          year: input.year,
          month: input.month,
          amount: input.amount,
          savings_target: input.savingsTarget,
        },
        { onConflict: 'user_id,year,month' },
      )
      .select(monthlyBudgetColumns)
      .single()

    if (error) throw error
    return { ...(data as Omit<MonthlyBudget, 'amount' | 'savings_target'>), amount: Number(data.amount), savings_target: Number(data.savings_target) }
  },

  async upsertCategoryBudget(userId: string, input: CategoryBudgetInput): Promise<CategoryBudget> {
    const { data, error } = await getSupabaseClient()
      .from('category_budgets')
      .upsert(
        { user_id: userId, monthly_budget_id: input.monthlyBudgetId, category_id: input.categoryId, amount: input.amount },
        { onConflict: 'monthly_budget_id,category_id' },
      )
      .select(categoryBudgetColumns)
      .single()

    if (error) throw error
    return { ...(data as Omit<CategoryBudget, 'amount'>), amount: Number(data.amount) }
  },

  async deleteCategoryBudget(userId: string, categoryBudgetId: string) {
    const { error } = await getSupabaseClient().from('category_budgets').delete().eq('id', categoryBudgetId).eq('user_id', userId)
    if (error) throw error
  },
}
