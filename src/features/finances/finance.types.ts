export const financialTransactionTypes = ['income', 'expense'] as const

export type FinancialTransactionType = (typeof financialTransactionTypes)[number]

export interface FinanceMonth {
  year: number
  month: number
}

export interface FinancialCategory {
  id: string
  user_id: string | null
  name: string
  type: FinancialTransactionType
  icon: string | null
  is_system: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface FinancialTransaction {
  id: string
  user_id: string
  type: FinancialTransactionType
  amount: number
  category_id: string | null
  description: string
  transaction_date: string
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  category: Pick<FinancialCategory, 'id' | 'name' | 'type' | 'icon' | 'is_system' | 'active'> | null
}

export interface FinancialTransactionInput {
  type: FinancialTransactionType
  amount: number
  categoryId: string
  description: string
  transactionDate: string
  paymentMethod?: string | null
  notes?: string | null
}

export interface FinancialCategoryInput {
  name: string
  type: FinancialTransactionType
  icon?: string | null
  active?: boolean
}

export interface MonthlyBudget {
  id: string
  user_id: string
  year: number
  month: number
  amount: number
  savings_target: number
  created_at: string
  updated_at: string
}

export interface MonthlyBudgetInput extends FinanceMonth {
  amount: number
  savingsTarget: number
}

export interface CategoryBudget {
  id: string
  user_id: string
  monthly_budget_id: string
  category_id: string
  amount: number
  created_at: string
  updated_at: string
}

export interface CategoryBudgetInput {
  monthlyBudgetId: string
  categoryId: string
  amount: number
}

export interface ExpenseByCategory {
  categoryId: string | null
  categoryName: string
  icon: string | null
  amount: number
}

export interface CumulativeExpensePoint {
  date: string
  amount: number
  cumulativeAmount: number
}

export interface CategoryBudgetOverview {
  id: string
  categoryId: string
  categoryName: string
  icon: string | null
  amount: number
  spent: number
}

export interface FinancialMonthOverview {
  incomeTotal: number
  expenseTotal: number
  balance: number
  budget: Pick<MonthlyBudget, 'id' | 'amount' | 'savings_target'> | null
  expenseByCategory: ExpenseByCategory[]
  cumulativeExpenses: CumulativeExpensePoint[]
  categoryBudgets: CategoryBudgetOverview[]
}

export interface SafeToSpendEstimate {
  available: number
  dailyAvailable: number | null
  daysRemaining: number
}

export interface FinancialOverview extends FinancialMonthOverview {
  safeToSpend: SafeToSpendEstimate
}

export interface TransactionFilters {
  type?: FinancialTransactionType | 'all'
  categoryId?: string
}
