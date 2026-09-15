import { Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/features/finances/finance.utils'
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge'
import { formatPaymentDate, getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import { formatLocalDateTime, getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import type { Currency } from '@/types/profile'

interface PaymentOccurrenceListProps {
  currency: Currency
  emptyMessage: string
  onMarkPaid: (payment: PaymentOccurrence) => void
  onUndo: (payment: PaymentOccurrence) => void
  payments: PaymentOccurrence[]
  processingId?: string
  timezone: string
  title: string
}

export function PaymentOccurrenceList({ title, payments, timezone, currency, emptyMessage, processingId, onMarkPaid, onUndo }: PaymentOccurrenceListProps) {
  const today = getTodayInTimeZone(timezone)
  return <section aria-labelledby={`payments-${title.toLocaleLowerCase('es-CL').replaceAll(' ', '-')}`} className="border-t border-[var(--border)] pt-6"><div className="flex items-baseline justify-between gap-3"><h2 className="text-lg font-bold tracking-[-0.025em] text-[var(--foreground)]" id={`payments-${title.toLocaleLowerCase('es-CL').replaceAll(' ', '-')}`}>{title}</h2><span className="text-sm font-medium text-[var(--foreground-muted)]">{payments.length}</span></div>{payments.length === 0 ? <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{emptyMessage}</p> : <ul className="mt-3">{payments.map((payment) => { const status = getPaymentOccurrenceStatus(payment, today); const paid = status === 'paid'; const historicalDate = paid && payment.paid_at ? `Pagado ${formatLocalDateTime(payment.paid_at, timezone)}` : formatPaymentDate(payment.due_date); return <li className="flex flex-col gap-3 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between" key={payment.id}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--foreground)]">{payment.recurring_payment?.name ?? 'Pago recurrente'}</p><PaymentStatusBadge status={status} /></div><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">{payment.recurring_payment?.category?.name ?? 'Sin categoría'} · {historicalDate}</p></div><div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end"><strong className="text-sm tabular-nums text-[var(--foreground)]">{formatCurrency(payment.amount, currency)}</strong>{paid ? <Button loading={processingId === payment.id} onClick={() => onUndo(payment)} size="sm" type="button" variant="ghost"><RotateCcw aria-hidden="true" className="size-3.5" />Deshacer</Button> : <Button loading={processingId === payment.id} onClick={() => onMarkPaid(payment)} size="sm" type="button" variant={status === 'overdue' ? 'danger' : 'secondary'}><Check aria-hidden="true" className="size-3.5" />Marcar pagado</Button>}</div></li> })}</ul>}</section>
}