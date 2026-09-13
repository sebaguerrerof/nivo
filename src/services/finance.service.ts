import { financeOverviewSchema } from '@/features/finances/finance.schemas'
import { calculateSafeToSpend, getDaysRemainingInMonth, getFinanceMonthBounds } from '@/features/finances/finance.utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import type {
  FinanceMonth,
  FinancialCategory,
  FinancialCategoryInput,
  FinancialOverview,
  FinancialTransaction,
  FinancialTransactionInput,
  TransactionFilters,
} from '@/features/finances/finance.types'

const categoryColumns = 'id, user_id, name, type, icon, is_system, active, created_at, updated_at'
const transactionColumns = 'id, user_id, type, amount, category_id, description, transaction_date, payment_method, notes, created_at, updated_at, category:financial_categories(id, name, type, icon, is_system, active)'

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized || null
}

function toTransaction(value: unknown): FinancialTransaction {
  const transaction = value as Omit<FinancialTransaction, 'amount' | 'category'> & {
    amount: string | number
    category: FinancialTransaction['category'] | FinancialTransaction['category'][] | null
  }

  return {
    ...transaction,
    amount: Number(transaction.amount),
    category: Array.isArray(transaction.category) ? transaction.category[0] ?? null : transaction.category,
  }
}

export const financeService = {
  async getCategories(type?: FinancialCategory['type'], includeInactive = false): Promise<FinancialCategory[]> {
    let query = getSupabaseClient().from('financial_categories').select(categoryColumns).order('is_system', { ascending: false }).order('name')
    if (type) query = query.eq('type', type)
    if (!includeInactive) query = query.eq('active', true)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as FinancialCategory[]
  },

  async createCategory(userId: string, input: FinancialCategoryInput): Promise<FinancialCategory> {
    const { data, error } = await getSupabaseClient()
      .from('financial_categories')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        type: input.type,
        icon: normalizeOptionalText(input.icon),
        active: input.active ?? true,
      })
      .select(categoryColumns)
      .single()

    if (error) throw error
    return data as FinancialCategory
  },

  async updateCategory(userId: string, categoryId: string, input: FinancialCategoryInput): Promise<FinancialCategory> {
    const { data, error } = await getSupabaseClient()
      .from('financial_categories')
      .update({ name: input.name.trim(), type: input.type, icon: normalizeOptionalText(input.icon), active: input.active ?? true })
      .eq('id', categoryId)
      .eq('user_id', userId)
      .eq('is_system', false)
      .select(categoryColumns)
      .single()

    if (error) throw error
    return data as FinancialCategory
  },

  async setCategoryActive(userId: string, categoryId: string, active: boolean): Promise<FinancialCategory> {
    const { data, error } = await getSupabaseClient()
      .from('financial_categories')
      .update({ active })
      .eq('id', categoryId)
      .eq('user_id', userId)
      .eq('is_system', false)
      .select(categoryColumns)
      .single()

    if (error) throw error
    return data as FinancialCategory
  },

  async deleteCategory(userId: string, categoryId: string) {
    const { error } = await getSupabaseClient()
      .from('financial_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)
      .eq('is_system', false)

    if (error) throw error
  },

  async getTransactions(userId: string, period: FinanceMonth, filters: TransactionFilters = {}): Promise<FinancialTransaction[]> {
    const { startDate, endDate } = getFinanceMonthBounds(period)
    let query = getSupabaseClient()
      .from('financial_transactions')
      .select(transactionColumns)
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type)
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map(toTransaction)
  },

  async createTransaction(userId: string, input: FinancialTransactionInput): Promise<FinancialTransaction> {
    const { data, error } = await getSupabaseClient()
      .from('financial_transactions')
      .insert({
        user_id: userId,
        type: input.type,
        amount: input.amount,
        category_id: input.categoryId,
        description: input.description.trim(),
        transaction_date: input.transactionDate,
        payment_method: normalizeOptionalText(input.paymentMethod),
        notes: normalizeOptionalText(input.notes),
      })
      .select(transactionColumns)
      .single()

    if (error) throw error
    return toTransaction(data)
  },

  async updateTransaction(userId: string, transactionId: string, input: FinancialTransactionInput): Promise<FinancialTransaction> {
    const { data, error } = await getSupabaseClient()
      .from('financial_transactions')
      .update({
        type: input.type,
        amount: input.amount,
        category_id: input.categoryId,
        description: input.description.trim(),
        transaction_date: input.transactionDate,
        payment_method: normalizeOptionalText(input.paymentMethod),
        notes: normalizeOptionalText(input.notes),
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select(transactionColumns)
      .single()

    if (error) throw error
    return toTransaction(data)
  },

  async deleteTransaction(userId: string, transactionId: string) {
    const { error } = await getSupabaseClient().from('financial_transactions').delete().eq('id', transactionId).eq('user_id', userId)
    if (error) throw error
  },

  async getFinancialOverview(period: FinanceMonth, timezone: string): Promise<FinancialOverview> {
    const { data, error } = await getSupabaseClient().rpc('get_financial_month_overview', { p_year: period.year, p_month: period.month })
    if (error) throw error

    const overview = financeOverviewSchema.parse(data)
    const daysRemaining = getDaysRemainingInMonth(period, timezone)
    return {
      ...overview,
      safeToSpend: calculateSafeToSpend(overview.incomeTotal, overview.expenseTotal, overview.budget?.savings_target ?? 0, daysRemaining),
    }
  },
}
