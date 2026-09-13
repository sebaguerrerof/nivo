import { Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/features/finances/finance.utils'
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge'
import { formatPaymentDate, getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { Currency } from '@/types/profile'

interface PaymentOccurrenceListProps {
  title: string
  payments: PaymentOccurrence[]
  timezone: string
  currency: Currency
  emptyMessage: string
  savingId?: string
  onMarkPaid: (payment: PaymentOccurrence) => void
  onUndo: (payment: PaymentOccurrence) => void
}

export function PaymentOccurrenceList({ title, payments, timezone, currency, emptyMessage, savingId, onMarkPaid, onUndo }: PaymentOccurrenceListProps) {
  const today = getTodayInTimeZone(timezone)
  return <Card className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{title}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{payments.length === 0 ? emptyMessage : `${payments.length} ${payments.length === 1 ? 'pago' : 'pagos'}`}</p></div></div>{payments.length > 0 ? <div className="mt-5 grid gap-3">{payments.map((payment) => { const status = getPaymentOccurrenceStatus(payment, today); const paid = status === 'paid'; return <article className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between" key={payment.id}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--foreground)]">{payment.recurring_payment?.name ?? 'Pago recurrente'}</p><PaymentStatusBadge status={status} /></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatPaymentDate(payment.due_date)} · {formatCurrency(payment.amount, currency)}{payment.payment_method ? ` · ${payment.payment_method}` : ''}</p></div>{paid ? <Button loading={savingId === payment.id} onClick={() => onUndo(payment)} size="sm" type="button" variant="ghost"><RotateCcw aria-hidden="true" className="size-3.5" />Deshacer</Button> : <Button loading={savingId === payment.id} onClick={() => onMarkPaid(payment)} size="sm" type="button" variant={status === 'overdue' ? 'danger' : 'secondary'}><Check aria-hidden="true" className="size-3.5" />Marcar pagado</Button>}</article> })}</div> : null}</Card>
}