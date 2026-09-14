import { ArrowRight, CreditCard, TrendingUp, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/features/finances/finance.utils'
import { formatPaymentDate, getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import type { FinancialOverview } from '@/features/finances/finance.types'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import type { GamificationSummary } from '@/types/gamification'
import type { Currency } from '@/types/profile'

interface DashboardGlanceProps {
  currency: Currency
  finance?: FinancialOverview
  payment?: PaymentOccurrence
  progress?: GamificationSummary
  timezone: string
  onMarkPayment: (payment: PaymentOccurrence) => void
}

export function DashboardGlance({ currency, finance, payment, progress, timezone, onMarkPayment }: DashboardGlanceProps) {
  const budgetUsage = finance?.budget && finance.budget.amount > 0 ? Math.round((finance.expenseTotal / finance.budget.amount) * 100) : null
  const paymentStatus = payment ? getPaymentOccurrenceStatus(payment, getTodayInTimeZone(timezone)) : null
  const paymentUrgent = paymentStatus === 'overdue' || paymentStatus === 'pending'

  return <section aria-label="Resumen personal" className="mt-8 border-y border-[var(--border-subtle)] py-1 sm:mt-10"><div className="grid divide-y divide-[var(--border-subtle)] md:grid-cols-3 md:divide-x md:divide-y-0"><article className="px-1 py-5 sm:px-4"><div className="flex items-center gap-2 text-[var(--foreground-muted)]"><TrendingUp aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Progreso</p></div><p className="mt-3 text-lg font-bold tracking-[-0.03em] text-[var(--foreground)]">Nivel {progress?.level.level ?? '—'}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{progress ? `${progress.totalXp.toLocaleString('es-CL')} XP acumulados` : 'Cargando tu progreso…'}</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/progress">Ver progreso<ArrowRight aria-hidden="true" className="size-3.5" /></Link></article><article className="px-1 py-5 sm:px-4"><div className="flex items-center gap-2 text-[var(--foreground-muted)]"><WalletCards aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Finanzas</p></div><p className="mt-3 text-lg font-bold tracking-[-0.03em] text-[var(--foreground)]">{finance ? formatCurrency(finance.safeToSpend.available, currency) : '—'}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{finance ? budgetUsage === null ? 'Sin presupuesto para este mes' : `${budgetUsage}% del presupuesto utilizado` : 'Disponible para gastar'}</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/finances">Ver finanzas<ArrowRight aria-hidden="true" className="size-3.5" /></Link></article><article className="px-1 py-5 sm:px-4"><div className="flex items-center gap-2 text-[var(--foreground-muted)]"><CreditCard aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Próximo pago</p></div><p className="mt-3 text-lg font-bold tracking-[-0.03em] text-[var(--foreground)]">{payment?.recurring_payment?.name ?? 'Sin pagos próximos'}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{payment ? `${paymentUrgent ? paymentStatus === 'overdue' ? 'Vencido' : 'Vence hoy' : formatPaymentDate(payment.due_date)} · ${formatCurrency(payment.amount, currency)}` : 'Todo al día por ahora'}</p>{payment && paymentUrgent ? <Button className="mt-4" onClick={() => onMarkPayment(payment)} size="sm" type="button">Marcar pagado</Button> : <Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" to="/payments">Ver pagos<ArrowRight aria-hidden="true" className="size-3.5" /></Link>}</article></div></section>
}