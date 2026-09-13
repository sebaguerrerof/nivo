import { getPaymentStatusMeta } from '@/features/payments/payment.utils'
import type { PaymentOccurrenceStatus } from '@/features/payments/payment.types'

interface PaymentStatusBadgeProps {
  status: PaymentOccurrenceStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const meta = getPaymentStatusMeta(status)
  const toneClassName = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    slate: 'bg-[var(--surface-muted)] text-[var(--foreground-muted)]',
  }[meta.tone]

  return <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-xs font-semibold ${toneClassName}`}>{meta.label}</span>
}