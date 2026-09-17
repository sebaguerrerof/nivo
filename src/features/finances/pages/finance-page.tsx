import { IonContent, IonPage } from '@ionic/react'
import { ArrowRight, CircleDollarSign, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { BudgetSection } from '@/features/finances/components/budget-section'
import { CategoryManager } from '@/features/finances/components/category-manager'
import { FinanceCharts } from '@/features/finances/components/finance-charts'
import { FinanceHero } from '@/features/finances/components/finance-hero'
import { FinanceMonthNavigator } from '@/features/finances/components/finance-month-navigator'
import { TransactionList } from '@/features/finances/components/transaction-list'
import { TransactionSheet } from '@/features/finances/components/transaction-sheet'
import { UpcomingFinancePayments } from '@/features/finances/components/upcoming-finance-payments'
import { useFinancialCategories, useFinancialOverview, useFinancialTransactions, useTransactionActions } from '@/features/finances/hooks/use-finances'
import { getCurrentFinanceMonth } from '@/features/finances/finance.utils'
import { getFinanceQuickAction } from '@/features/finances/finance-route.utils'
import { MarkPaymentSheet } from '@/features/payments/components/mark-payment-sheet'
import { usePaymentActions, useUpcomingPayments } from '@/features/payments/hooks/use-payments'
import type { FinancialTransaction, FinancialTransactionType, TransactionFilters } from '@/features/finances/finance.types'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { useProfile } from '@/hooks/use-profile'

interface TransactionSheetState {
  type: FinancialTransactionType
  transaction: FinancialTransaction | null
}

function FinanceLoadingState() {
  return <section aria-label="Cargando situación financiera" className="grid gap-8"><div className="h-[31rem] animate-pulse rounded-[var(--radius-hero)] bg-[var(--surface-subtle)] sm:h-96" /><div className="flex gap-3"><div className="h-11 w-36 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-subtle)]" /><div className="h-11 w-36 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface-subtle)]" /></div><div className="grid gap-4"><div className="h-7 w-48 animate-pulse rounded-[10px] bg-[var(--surface-subtle)]" /><div className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" /><div className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" /></div></section>
}

function TransactionsLoadingState() {
  return <section aria-label="Cargando movimientos" className="grid gap-4"><div className="h-8 w-56 animate-pulse rounded-[10px] bg-[var(--surface-subtle)]" /><div className="h-11 w-full animate-pulse rounded-full bg-[var(--surface-subtle)]" /><div className="grid gap-3 border-y border-[var(--border-subtle)] py-4">{Array.from({ length: 3 }, (_, index) => <div className="h-16 animate-pulse rounded-[var(--radius-control)] bg-[var(--surface-subtle)]" key={index} />)}</div></section>
}

export function FinancePage() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const currency = profile?.currency || 'CLP'
  const [period, setPeriod] = useState(() => getCurrentFinanceMonth(timezone))
  const [filters, setFilters] = useState<TransactionFilters>({ type: 'all' })
  const [sheet, setSheet] = useState<TransactionSheetState | null>(null)
  const [markingPayment, setMarkingPayment] = useState<PaymentOccurrence | null>(null)
  const quickAction = getFinanceQuickAction(location.search)

  useEffect(() => {
    if (quickAction === 'expense') setSheet({ type: 'expense', transaction: null })
    if (quickAction === 'income') setSheet({ type: 'income', transaction: null })
  }, [quickAction])

  const categories = useFinancialCategories(user?.id, true)
  const overview = useFinancialOverview(user?.id, period, timezone)
  const transactions = useFinancialTransactions(user?.id, period, filters)
  const transactionActions = useTransactionActions(user?.id ?? '')
  const upcomingPayments = useUpcomingPayments(user?.id, timezone, 3)
  const paymentActions = usePaymentActions(user?.id ?? '')
  const activeCategories = useMemo(() => (categories.data ?? []).filter((category) => category.active), [categories.data])

  const deleteTransaction = async (transaction: FinancialTransaction) => {
    if (!window.confirm(`¿Eliminar “${transaction.description}”? Esta acción no se puede deshacer.`)) return
    try {
      await transactionActions.remove.mutateAsync(transaction.id)
    } catch {
      window.alert('No pudimos eliminar el movimiento. Intenta nuevamente.')
    }
  }

  const openTransaction = (type: FinancialTransactionType) => setSheet({ type, transaction: null })
  const isError = overview.isError || transactions.isError || categories.isError || upcomingPayments.isError

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10 lg:pt-10 xl:px-12">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-[-0.055em] text-[var(--foreground)] sm:text-4xl">Finanzas</h1><p className="mt-2 text-[15px] text-[var(--foreground-muted)]">Tu dinero, con claridad.</p></div><FinanceMonthNavigator onChange={setPeriod} value={period} /></header>
            {isError ? <div className="mb-6"><Alert variant="error">No pudimos cargar tus finanzas. Actualiza la página e inténtalo nuevamente.</Alert></div> : null}
            {overview.isLoading ? <FinanceLoadingState /> : null}
            {overview.data ? <div className="grid gap-10 sm:gap-12"><FinanceHero currency={currency} overview={overview.data} /><section aria-label="Acciones financieras" className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-8 sm:flex-row sm:items-center"><Button onClick={() => openTransaction('expense')} type="button"><Plus aria-hidden="true" className="size-4" />Agregar gasto</Button><Button onClick={() => openTransaction('income')} type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar ingreso</Button><Link className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[var(--foreground-muted)] no-underline transition hover:text-[var(--foreground)] sm:ml-2" to="/payments">Ver pagos recurrentes<ArrowRight aria-hidden="true" className="size-4" /></Link></section>{transactions.isLoading ? <TransactionsLoadingState /> : <TransactionList categories={categories.data ?? []} currency={currency} deletingId={transactionActions.remove.variables} filters={filters} onAddExpense={() => openTransaction('expense')} onAddIncome={() => openTransaction('income')} onDelete={(transaction) => void deleteTransaction(transaction)} onEdit={(transaction) => setSheet({ type: transaction.type, transaction })} onFiltersChange={setFilters} period={period} timezone={timezone} transactions={transactions.data ?? []} />}<section className="grid gap-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)] xl:gap-12"><BudgetSection initiallyEditing={quickAction === 'budget'} categories={categories.data ?? []} currency={currency} overview={overview.data} period={period} userId={user?.id ?? ''} /><UpcomingFinancePayments currency={currency} loading={upcomingPayments.isLoading} onMarkPaid={setMarkingPayment} payments={upcomingPayments.data ?? []} timezone={timezone} /></section><FinanceCharts currency={currency} overview={overview.data} /><CategoryManager categories={categories.data ?? []} userId={user?.id ?? ''} /></div> : null}
            {!overview.isLoading && !overview.data && !overview.isError ? <section className="grid min-h-52 place-items-center border-y border-[var(--border-subtle)] px-5 text-center"><div><CircleDollarSign aria-hidden="true" className="mx-auto size-6 text-teal-700 dark:text-teal-300" /><p className="mt-3 font-semibold text-[var(--foreground)]">Preparando tus finanzas.</p></div></section> : null}
          </div>
        </main>
        {sheet ? <TransactionSheet categories={activeCategories} initialType={sheet.type} onClose={() => setSheet(null)} onSave={(input) => sheet.transaction ? transactionActions.update.mutateAsync({ transactionId: sheet.transaction.id, input }) : transactionActions.create.mutateAsync(input)} open period={period} saving={transactionActions.create.isPending || transactionActions.update.isPending} timezone={timezone} transaction={sheet.transaction} /> : null}
        <MarkPaymentSheet occurrence={markingPayment} onClose={() => setMarkingPayment(null)} onSave={(input) => paymentActions.markPaid.mutateAsync({ occurrenceId: markingPayment?.id ?? '', input })} saving={paymentActions.markPaid.isPending} timezone={timezone} />
      </IonContent>
    </IonPage>
  )
}