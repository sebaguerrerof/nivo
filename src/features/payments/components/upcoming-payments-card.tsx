import { AlertCircle, ArrowRight, CalendarClock, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/features/finances/finance.utils'
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge'
import { formatPaymentDate, getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { Currency } from '@/types/profile'

interface UpcomingPaymentsCardProps {
  payments: PaymentOccurrence[]
  timezone: string
  currency: Currency
  title?: string
  emptyMessage?: string
  onMarkPaid?: (occurrence: PaymentOccurrence) => void
}

export function UpcomingPaymentsCard({ payments, timezone, currency, title = 'Próximos pagos', emptyMessage = 'No tienes pagos pendientes por ahora.', onMarkPaid }: UpcomingPaymentsCardProps) {
  const today = getTodayInTimeZone(timezone)

  return <Card className="p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><CalendarClock aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">{title}</p></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">Tus compromisos pendientes, antes de que se conviertan en una sorpresa.</p></div><Link className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/payments">Ver todos<ArrowRight aria-hidden="true" className="size-3.5" /></Link></div>
    {payments.length === 0 ? <div className="mt-5 rounded-xl bg-[var(--surface-muted)] px-4 py-5 text-sm text-[var(--foreground-muted)]">{emptyMessage}</div> : <div className="mt-5 grid gap-3">{payments.map((payment) => {
      const status = getPaymentOccurrenceStatus(payment, today)
      const isOverdue = status === 'overdue'
      return <article className={`flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between ${isOverdue ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20' : 'border-[var(--border)]'}`} key={payment.id}>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-[var(--foreground)]">{payment.recurring_payment?.name ?? 'Pago recurrente'}</p><PaymentStatusBadge status={status} /></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatPaymentDate(payment.due_date)} · {formatCurrency(payment.amount, currency)}</p></div>
        {onMarkPaid ? <Button onClick={() => onMarkPaid(payment)} size="sm" type="button" variant={isOverdue ? 'danger' : 'secondary'}><Check aria-hidden="true" className="size-3.5" />Marcar pagado</Button> : isOverdue ? <Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white transition hover:bg-rose-700" to="/payments"><AlertCircle aria-hidden="true" className="size-3.5" />Resolver</Link> : null}
      </article>
    })}</div>}
  </Card>
}
export { UpcomingPaymentsCard as UpcomingPayments }
