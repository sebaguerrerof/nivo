import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeKeys } from '@/features/finances/finance.keys'
import type { FinanceMonth } from '@/features/finances/finance.types'
import { paymentKeys } from '@/features/payments/payment.keys'
import type { MarkPaymentOccurrenceInput, RecurringPaymentInput } from '@/features/payments/payment.types'
import { paymentService } from '@/services/payment.service'

function invalidatePayments(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: paymentKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: financeKeys.user(userId) }),
  ])
}

export function useRecurringPayments(userId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: userId ? paymentKeys.recurring(userId, includeInactive) : paymentKeys.all,
    queryFn: () => paymentService.getRecurringPayments(userId as string, includeInactive),
    enabled: Boolean(userId),
  })
}

export function usePaymentOccurrences(userId: string | undefined, period: FinanceMonth) {
  return useQuery({
    queryKey: userId ? paymentKeys.occurrences(userId, period) : paymentKeys.all,
    queryFn: () => paymentService.getPaymentOccurrences(userId as string, period),
    enabled: Boolean(userId),
  })
}

export function useUpcomingPayments(userId: string | undefined, timezone: string, limit = 3) {
  return useQuery({
    queryKey: userId ? paymentKeys.upcoming(userId, timezone, limit) : paymentKeys.all,
    queryFn: () => paymentService.getUpcomingPayments(userId as string, timezone, limit),
    enabled: Boolean(userId),
  })
}

export function useOverduePayments(userId: string | undefined, timezone: string) {
  return useQuery({
    queryKey: userId ? paymentKeys.overdue(userId, timezone) : paymentKeys.all,
    queryFn: () => paymentService.getOverduePayments(userId as string, timezone),
    enabled: Boolean(userId),
  })
}

export function usePaymentActions(userId: string) {
  const queryClient = useQueryClient()
  const refresh = () => invalidatePayments(queryClient, userId)
  return {
    create: useMutation({ mutationFn: (input: RecurringPaymentInput) => paymentService.createRecurringPayment(input), onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ paymentId, input }: { paymentId: string; input: RecurringPaymentInput }) => paymentService.updateRecurringPayment(paymentId, input), onSuccess: refresh }),
    setActive: useMutation({ mutationFn: ({ paymentId, active }: { paymentId: string; active: boolean }) => paymentService.setRecurringPaymentActive(paymentId, active), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (paymentId: string) => paymentService.deleteRecurringPayment(paymentId), onSuccess: refresh }),
    markPaid: useMutation({ mutationFn: ({ occurrenceId, input }: { occurrenceId: string; input: MarkPaymentOccurrenceInput }) => paymentService.markOccurrencePaid(occurrenceId, input), onSuccess: refresh }),
    undo: useMutation({ mutationFn: (occurrenceId: string) => paymentService.undoOccurrence(occurrenceId), onSuccess: refresh }),
  }
}