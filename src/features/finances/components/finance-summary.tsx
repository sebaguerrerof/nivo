import { ArrowDownRight, ArrowUpRight, CircleDollarSign, WalletCards } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency, getBudgetUsage } from '@/features/finances/finance.utils'
import type { FinancialOverview } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface FinanceSummaryProps {
  overview: FinancialOverview
  currency: Currency
}

interface SummaryMetricProps {
  label: string
  value: number
  hasMovements: boolean
  currency: Currency
  icon: typeof ArrowUpRight
  iconClassName: string
}

function SummaryMetric({ label, value, hasMovements, currency, icon: Icon, iconClassName }: SummaryMetricProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--foreground-muted)]">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${iconClassName}`}><Icon aria-hidden="true" className="size-4" /></span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-[-0.045em] text-[var(--foreground)]">{hasMovements ? formatCurrency(value, currency) : '—'}</p>
      <p className="mt-1 text-xs text-[var(--foreground-subtle)]">{hasMovements ? 'Según tus movimientos registrados.' : 'Aún sin movimientos registrados.'}</p>
    </Card>
  )
}

export function FinanceSummary({ overview, currency }: FinanceSummaryProps) {
  const hasMovements = overview.incomeTotal > 0 || overview.expenseTotal > 0
  const usage = getBudgetUsage(overview.expenseTotal, overview.budget?.amount ?? null)

  return (
    <section aria-label="Resumen financiero" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryMetric currency={currency} hasMovements={hasMovements} icon={ArrowUpRight} iconClassName="bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" label="Ingresos del mes" value={overview.incomeTotal} />
      <SummaryMetric currency={currency} hasMovements={hasMovements} icon={ArrowDownRight} iconClassName="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" label="Gastos del mes" value={overview.expenseTotal} />
      <SummaryMetric currency={currency} hasMovements={hasMovements} icon={WalletCards} iconClassName="bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" label="Disponible registrado" value={overview.balance} />
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-[var(--foreground-muted)]">Presupuesto utilizado</p><span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><CircleDollarSign aria-hidden="true" className="size-4" /></span></div>
        <p className="mt-4 text-2xl font-bold tracking-[-0.045em] text-[var(--foreground)]">{usage ? `${usage.percentage}%` : '—'}</p>
        <p className="mt-1 text-xs text-[var(--foreground-subtle)]">{usage ? `${formatCurrency(overview.expenseTotal, currency)} de ${formatCurrency(overview.budget!.amount, currency)}` : 'Define un presupuesto para seguirlo.'}</p>
      </Card>
    </section>
  )
}
