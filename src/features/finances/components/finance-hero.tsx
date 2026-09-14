import { ArrowDownRight, ArrowRight, ArrowUpRight, PiggyBank, WalletCards } from 'lucide-react'
import { formatCurrency, getBudgetUsage, getBudgetUsageStateClass } from '@/features/finances/finance.utils'
import type { FinancialOverview } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface FinanceHeroProps {
  overview: FinancialOverview
  currency: Currency
}

export function FinanceHero({ overview, currency }: FinanceHeroProps) {
  const usage = getBudgetUsage(overview.expenseTotal, overview.budget?.amount ?? null)
  const hasCommitments = overview.committedPending > 0 || (overview.budget?.savings_target ?? 0) > 0
  const availableClassName = overview.safeToSpend.available < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-[var(--foreground)]'

  return (
    <section aria-label="Situación financiera" className="relative overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-elevated)] sm:p-8">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-teal-600 dark:bg-teal-400" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] xl:gap-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Tu mes</p>
          <p className="mt-5 text-sm font-medium text-[var(--foreground-muted)]">Disponible registrado</p>
          <p className="mt-2 break-words text-4xl font-bold leading-none tracking-[-0.065em] tabular-nums text-[var(--foreground)] sm:text-5xl">
            {formatCurrency(overview.balance, currency)}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">Ingresos menos gastos que registraste en este mes.</p>

          <div className="mt-7 grid grid-cols-2 divide-x divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] py-4">
            <div className="pr-4 sm:pr-6">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><ArrowUpRight aria-hidden="true" className="size-4" /><p className="text-xs font-semibold">Ingresos</p></div>
              <p className="mt-2 break-words text-lg font-bold tracking-[-0.03em] tabular-nums text-[var(--foreground)]">+{formatCurrency(overview.incomeTotal, currency)}</p>
            </div>
            <div className="pl-4 sm:pl-6">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300"><ArrowDownRight aria-hidden="true" className="size-4" /><p className="text-xs font-semibold">Gastos</p></div>
              <p className="mt-2 break-words text-lg font-bold tracking-[-0.03em] tabular-nums text-[var(--foreground)]">−{formatCurrency(overview.expenseTotal, currency)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-7 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <div>
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]"><PiggyBank aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Presupuesto</p></div>
            {overview.budget && usage ? <>
              <div className="mt-3 flex items-end justify-between gap-4"><p className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(overview.expenseTotal, currency)} de {formatCurrency(overview.budget.amount, currency)}</p><p className="shrink-0 text-sm font-bold text-[var(--foreground)]">{usage.percentage}%</p></div>
              <div aria-label={`${usage.percentage}% del presupuesto utilizado`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.min(usage.percentage, 100)} className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className={`h-full rounded-full ${getBudgetUsageStateClass(usage.state)}`} style={{ width: `${Math.min(usage.percentage, 100)}%` }} /></div>
              <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">{usage.remaining >= 0 ? `${formatCurrency(usage.remaining, currency)} restantes` : 'Has superado el límite de este mes.'}</p>
              <a className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)]" href="#presupuesto">Editar presupuesto<ArrowRight aria-hidden="true" className="size-3.5" /></a>
            </> : <>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">Aún no has definido un presupuesto para este mes.</p>
              <a className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" href="#presupuesto">Crear presupuesto<ArrowRight aria-hidden="true" className="size-3.5" /></a>
            </>}
          </div>

          <div className="mt-7 border-t border-[var(--border-subtle)] pt-6">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]"><WalletCards aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" /><p className="text-xs font-semibold">Disponible para gastar</p></div>
            <p className={`mt-3 break-words text-3xl font-bold tracking-[-0.05em] tabular-nums ${availableClassName}`}>{formatCurrency(overview.safeToSpend.available, currency)}</p>
            {overview.safeToSpend.dailyAvailable === null ? <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Estimación disponible para meses en curso o futuros.</p> : <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Aprox. <span className="font-semibold text-[var(--foreground)]">{formatCurrency(overview.safeToSpend.dailyAvailable, currency)} por día</span> durante {overview.safeToSpend.daysRemaining} días.</p>}
            {hasCommitments ? <dl className="mt-4 grid gap-1 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--foreground-muted)]">{overview.committedPending > 0 ? <div className="flex items-center justify-between gap-3"><dt>Pagos pendientes</dt><dd className="font-semibold text-amber-700 dark:text-amber-300">−{formatCurrency(overview.committedPending, currency)}</dd></div> : null}{(overview.budget?.savings_target ?? 0) > 0 ? <div className="flex items-center justify-between gap-3"><dt>Meta de ahorro</dt><dd className="font-semibold text-[var(--foreground)]">−{formatCurrency(overview.budget!.savings_target, currency)}</dd></div> : null}</dl> : null}
            <p className="mt-4 text-xs leading-5 text-[var(--foreground-subtle)]">Estimación según tus movimientos, pagos pendientes y meta de ahorro.</p>
          </div>
        </div>
      </div>
    </section>
  )
}