import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeKeys } from '@/features/finances/finance.keys'
import { budgetService } from '@/services/budget.service'
import { financeService } from '@/services/finance.service'
import type {
  CategoryBudgetInput,
  FinanceMonth,
  FinancialCategoryInput,
  FinancialTransactionInput,
  TransactionFilters,
} from '@/features/finances/finance.types'

function invalidateFinance(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return queryClient.invalidateQueries({ queryKey: financeKeys.user(userId) })
}

export function useFinancialCategories(userId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: userId ? financeKeys.categories(userId, includeInactive) : financeKeys.all,
    queryFn: () => financeService.getCategories(undefined, includeInactive),
    enabled: Boolean(userId),
  })
}

export function useFinancialTransactions(userId: string | undefined, period: FinanceMonth, filters: TransactionFilters) {
  return useQuery({
    queryKey: userId ? financeKeys.transactions(userId, period, filters) : financeKeys.all,
    queryFn: () => financeService.getTransactions(userId as string, period, filters),
    enabled: Boolean(userId),
  })
}

export function useFinancialOverview(userId: string | undefined, period: FinanceMonth, timezone: string) {
  return useQuery({
    queryKey: userId ? financeKeys.overview(userId, period, timezone) : financeKeys.all,
    queryFn: () => financeService.getFinancialOverview(period, timezone),
    enabled: Boolean(userId),
  })
}

export function useTransactionActions(userId: string) {
  const queryClient = useQueryClient()
  const refresh = () => invalidateFinance(queryClient, userId)

  return {
    create: useMutation({ mutationFn: (input: FinancialTransactionInput) => financeService.createTransaction(userId, input), onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ transactionId, input }: { transactionId: string; input: FinancialTransactionInput }) => financeService.updateTransaction(userId, transactionId, input), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (transactionId: string) => financeService.deleteTransaction(userId, transactionId), onSuccess: refresh }),
  }
}

export function useMonthlyBudgetActions(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { year: number; month: number; amount: number; savingsTarget: number }) => budgetService.upsertMonthlyBudget(userId, input),
    onSuccess: () => invalidateFinance(queryClient, userId),
  })
}

export function useCategoryBudgetActions(userId: string) {
  const queryClient = useQueryClient()
  return {
    upsert: useMutation({ mutationFn: (input: CategoryBudgetInput) => budgetService.upsertCategoryBudget(userId, input), onSuccess: () => invalidateFinance(queryClient, userId) }),
    remove: useMutation({ mutationFn: (categoryBudgetId: string) => budgetService.deleteCategoryBudget(userId, categoryBudgetId), onSuccess: () => invalidateFinance(queryClient, userId) }),
  }
}

export function useFinancialCategoryActions(userId: string) {
  const queryClient = useQueryClient()
  const refresh = () => invalidateFinance(queryClient, userId)
  return {
    create: useMutation({ mutationFn: (input: FinancialCategoryInput) => financeService.createCategory(userId, input), onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ categoryId, input }: { categoryId: string; input: FinancialCategoryInput }) => financeService.updateCategory(userId, categoryId, input), onSuccess: refresh }),
    setActive: useMutation({ mutationFn: ({ categoryId, active }: { categoryId: string; active: boolean }) => financeService.setCategoryActive(userId, categoryId, active), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (categoryId: string) => financeService.deleteCategory(userId, categoryId), onSuccess: refresh }),
  }
}
