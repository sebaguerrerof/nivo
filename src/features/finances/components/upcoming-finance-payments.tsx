import { ArrowRight, CalendarClock, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/features/finances/finance.utils'
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge'
import { formatPaymentDate, getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { Currency } from '@/types/profile'

interface UpcomingFinancePaymentsProps {
  payments: PaymentOccurrence[]
  timezone: string
  currency: Currency
  loading?: boolean
  onMarkPaid: (occurrence: PaymentOccurrence) => void
}

export function UpcomingFinancePayments({ payments, timezone, currency, loading = false, onMarkPaid }: UpcomingFinancePaymentsProps) {
  const today = getTodayInTimeZone(timezone)

  return (
    <section aria-label="Próximos pagos" className="border-t border-[var(--border-subtle)] pt-6 xl:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-[var(--foreground-muted)]"><CalendarClock aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Próximos pagos</p></div><h2 className="mt-2 text-xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Compromisos del mes</h2><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Lo que ya está considerado antes de gastar.</p></div>
        <Link className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--foreground-muted)] no-underline hover:text-[var(--foreground)]" to="/payments">Ver todos<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
      </div>
      {loading ? <div aria-label="Cargando pagos próximos" className="mt-5 grid gap-3"><div className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" /><div className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" /></div> : null}
      {!loading && payments.length === 0 ? <p className="mt-5 border-y border-[var(--border-subtle)] py-5 text-sm leading-6 text-[var(--foreground-muted)]">No tienes pagos pendientes por ahora.</p> : null}
      {!loading && payments.length > 0 ? <div className="mt-5 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">{payments.map((payment) => {
        const status = getPaymentOccurrenceStatus(payment, today)
        const needsAttention = status === 'overdue' || status === 'pending'
        return <article className="flex items-center gap-3 py-4" key={payment.id}><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${status === 'overdue' ? 'bg-rose-500' : status === 'pending' ? 'bg-amber-500' : 'bg-teal-600'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{payment.recurring_payment?.name ?? 'Pago recurrente'}</p><PaymentStatusBadge status={status} /></div><p className="mt-1 text-xs text-[var(--foreground-muted)]">{formatPaymentDate(payment.due_date)}</p></div><div className="shrink-0 text-right"><p className="text-sm font-bold tabular-nums text-[var(--foreground)]">{formatCurrency(payment.amount, currency)}</p>{needsAttention ? <Button className="mt-2" onClick={() => onMarkPaid(payment)} size="sm" type="button" variant={status === 'overdue' ? 'danger' : 'secondary'}><Check aria-hidden="true" className="size-3.5" />Pagar</Button> : null}</div></article>
      })}</div> : null}
    </section>
  )
}