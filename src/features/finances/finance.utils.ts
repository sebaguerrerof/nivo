import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTodayInTimeZone, isCalendarDate } from '@/features/planning/planning.utils'
import type { Currency } from '@/types/profile'
import type { FinanceMonth, FinancialMonthOverview, SafeToSpendEstimate } from '@/features/finances/finance.types'

export type BudgetUsageState = 'normal' | 'attention' | 'high' | 'exceeded'

function monthKey(month: FinanceMonth) {
  return month.year * 12 + month.month
}

export function getCurrentFinanceMonth(timezone: string, now = new Date()): FinanceMonth {
  const [year, month] = getTodayInTimeZone(timezone, now).split('-').map(Number)
  return { year, month }
}

export function getAdjacentFinanceMonth(current: FinanceMonth, direction: -1 | 1): FinanceMonth {
  const shifted = new Date(Date.UTC(current.year, current.month - 1 + direction, 1))
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 }
}

export function getFinanceMonthBounds(period: FinanceMonth) {
  const first = new Date(Date.UTC(period.year, period.month - 1, 1))
  const last = new Date(Date.UTC(period.year, period.month, 0))
  return { startDate: first.toISOString().slice(0, 10), endDate: last.toISOString().slice(0, 10), daysInMonth: last.getUTCDate() }
}

export function formatFinanceMonth(period: FinanceMonth) {
  const value = format(new Date(Date.UTC(period.year, period.month - 1, 1)), "MMMM 'de' yyyy", { locale: es })
  return value.charAt(0).toLocaleUpperCase('es-CL') + value.slice(1)
}

export function getDefaultTransactionDate(period: FinanceMonth, timezone: string, now = new Date()) {
  const today = getTodayInTimeZone(timezone, now)
  const currentMonth = getCurrentFinanceMonth(timezone, now)
  if (monthKey(period) === monthKey(currentMonth)) return today
  return getFinanceMonthBounds(period).startDate
}

export function getDaysRemainingInMonth(period: FinanceMonth, timezone: string, now = new Date()) {
  const currentMonth = getCurrentFinanceMonth(timezone, now)
  const comparison = monthKey(period) - monthKey(currentMonth)
  const { daysInMonth } = getFinanceMonthBounds(period)
  if (comparison < 0) return 0
  if (comparison > 0) return daysInMonth
  return daysInMonth - Number(getTodayInTimeZone(timezone, now).slice(-2)) + 1
}

export function calculateSafeToSpend(
  incomeTotal: number,
  expenseTotal: number,
  savingsTarget: number,
  daysRemaining: number,
): SafeToSpendEstimate {
  const available = incomeTotal - expenseTotal - savingsTarget
  return {
    available,
    dailyAvailable: daysRemaining > 0 ? available / daysRemaining : null,
    daysRemaining,
  }
}

export function getBudgetUsage(expenseTotal: number, budgetAmount: number | null) {
  if (budgetAmount === null || budgetAmount <= 0) return null
  const percentage = Math.round((expenseTotal / budgetAmount) * 100)
  const state: BudgetUsageState = percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'high' : percentage >= 70 ? 'attention' : 'normal'
  return { percentage, remaining: budgetAmount - expenseTotal, state }
}

export function getBudgetUsageStateClass(state: BudgetUsageState) {
  return {
    normal: 'bg-[var(--budget-normal)]',
    attention: 'bg-[var(--budget-attention)]',
    high: 'bg-[var(--budget-high)]',
    exceeded: 'bg-[var(--budget-exceeded)]',
  }[state]
}

export function formatCurrency(amount: number, currency: Currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount)
}

export function formatTransactionDate(value: string, timezone: string) {
  if (!isCalendarDate(value)) return value
  const today = getTodayInTimeZone(timezone)
  if (value === today) return 'Hoy'
  const date = new Date(`${value}T12:00:00Z`)
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

export function groupTransactionsByDate<T extends { transaction_date: string }>(transactions: T[]) {
  return transactions.reduce<Record<string, T[]>>((groups, transaction) => {
    groups[transaction.transaction_date] ??= []
    groups[transaction.transaction_date].push(transaction)
    return groups
  }, {})
}

export function buildFinanceInsights(overview: FinancialMonthOverview) {
  const insights: string[] = []
  const usage = getBudgetUsage(overview.expenseTotal, overview.budget?.amount ?? null)
  const topCategory = overview.expenseByCategory[0]

  if (usage) insights.push(`Has utilizado ${usage.percentage}% de tu presupuesto mensual.`)
  if (topCategory) insights.push(`${topCategory.categoryName} es tu categoría de mayor gasto este mes.`)
  if (overview.balance < 0) insights.push('Tus gastos registrados superan tus ingresos registrados este mes.')

  return insights
}
