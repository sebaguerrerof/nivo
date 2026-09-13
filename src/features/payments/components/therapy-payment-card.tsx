import { Check, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/features/finances/finance.utils'
import { PaymentStatusBadge } from '@/features/payments/components/payment-status-badge'
import { formatPaymentDate, getPaymentOccurrenceStatus, isTherapyPayment } from '@/features/payments/payment.utils'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { Currency } from '@/types/profile'

interface TherapyPaymentCardProps {
  payments: PaymentOccurrence[]
  timezone: string
  currency: Currency
  onMarkPaid?: (payment: PaymentOccurrence) => void
}

export function TherapyPaymentCard({ payments, timezone, currency, onMarkPaid }: TherapyPaymentCardProps) {
  const therapy = payments.find(isTherapyPayment)
  if (!therapy) return null
  const status = getPaymentOccurrenceStatus(therapy, getTodayInTimeZone(timezone))

  return <Card className="relative overflow-hidden border-teal-200 bg-gradient-to-br from-teal-50/80 to-[var(--surface)] p-5 dark:border-teal-900/60 dark:from-teal-950/30"><div className="absolute -right-7 -top-7 size-28 rounded-full bg-teal-200/40 blur-2xl dark:bg-teal-700/20" /><div className="relative flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><HeartHandshake aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Tu terapia</p></div><p className="mt-3 text-lg font-bold tracking-[-0.025em] text-[var(--foreground)]">{formatCurrency(therapy.amount, currency)}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Próximo pago · {formatPaymentDate(therapy.due_date)}</p></div><PaymentStatusBadge status={status} /></div><div className="relative mt-5 flex flex-wrap gap-3">{onMarkPaid ? <Button onClick={() => onMarkPaid(therapy)} size="sm" type="button" variant={status === 'overdue' ? 'danger' : 'primary'}><Check aria-hidden="true" className="size-3.5" />Marcar como pagado</Button> : <Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white transition hover:bg-teal-800" to="/payments"><Check aria-hidden="true" className="size-3.5" />Marcar como pagado</Link>}<Link className="inline-flex min-h-9 items-center justify-center text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/payments">Ver historial</Link></div></Card>
}