import { IonContent, IonPage } from '@ionic/react'
import { CircleDollarSign, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { BudgetSection } from '@/features/finances/components/budget-section'
import { CategoryManager } from '@/features/finances/components/category-manager'
import { FinanceCharts } from '@/features/finances/components/finance-charts'
import { FinanceMonthNavigator } from '@/features/finances/components/finance-month-navigator'
import { FinanceSummary } from '@/features/finances/components/finance-summary'
import { TransactionList } from '@/features/finances/components/transaction-list'
import { TransactionSheet } from '@/features/finances/components/transaction-sheet'
import { useFinancialCategories, useFinancialOverview, useFinancialTransactions, useTransactionActions } from '@/features/finances/hooks/use-finances'
import { getCurrentFinanceMonth } from '@/features/finances/finance.utils'
import { MarkPaymentSheet } from '@/features/payments/components/mark-payment-sheet'
import { TherapyPaymentCard } from '@/features/payments/components/therapy-payment-card'
import { UpcomingPaymentsCard } from '@/features/payments/components/upcoming-payments-card'
import { usePaymentActions, useUpcomingPayments } from '@/features/payments/hooks/use-payments'
import type { PaymentOccurrence } from '@/features/payments/payment.types'
import type { FinancialTransaction, FinancialTransactionType, TransactionFilters } from '@/features/finances/finance.types'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { useProfile } from '@/hooks/use-profile'

interface TransactionSheetState {
  type: FinancialTransactionType
  transaction: FinancialTransaction | null
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

  useEffect(() => {
    const quick = new URLSearchParams(location.search).get('quick')
    if (quick === 'expense') setSheet({ type: 'expense', transaction: null })
    if (quick === 'income') setSheet({ type: 'income', transaction: null })
  }, [location.search])
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

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mx-auto max-w-6xl">
            <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground-muted)]">Tu dinero, con claridad</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Finanzas</h1>
                <p className="mt-2 max-w-xl text-[15px] text-[var(--foreground-muted)]">Registra lo esencial y entiende el ritmo de tu mes sin convertirlo en contabilidad.</p>
              </div>
              <FinanceMonthNavigator onChange={setPeriod} value={period} />
            </header>

            <div className="mb-6 flex flex-wrap gap-3">
              <Button onClick={() => setSheet({ type: 'expense', transaction: null })} type="button"><Plus aria-hidden="true" className="size-4" />Agregar gasto</Button>
              <Button onClick={() => setSheet({ type: 'income', transaction: null })} type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar ingreso</Button>
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--surface-muted)]" to="/payments">Pagos recurrentes</Link>
            </div>

            {overview.isError || transactions.isError || categories.isError || upcomingPayments.isError ? <Alert variant="error">No pudimos cargar tus finanzas. Actualiza la página e inténtalo nuevamente.</Alert> : null}
            {overview.isLoading ? <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Card className="h-36 animate-pulse bg-[var(--surface-muted)]" key={index} />)}</section> : null}
            {overview.data ? <div className="grid gap-5">
              <FinanceSummary currency={currency} overview={overview.data} />
              <section className="grid gap-5 lg:grid-cols-2"><TherapyPaymentCard currency={currency} onMarkPaid={setMarkingPayment} payments={upcomingPayments.data ?? []} timezone={timezone} /><UpcomingPaymentsCard currency={currency} payments={upcomingPayments.data ?? []} timezone={timezone} /></section>
              <BudgetSection categories={categories.data ?? []} currency={currency} overview={overview.data} period={period} userId={user?.id ?? ''} />
              <TransactionList categories={categories.data ?? []} currency={currency} deletingId={transactionActions.remove.variables} filters={filters} onAddExpense={() => setSheet({ type: 'expense', transaction: null })} onAddIncome={() => setSheet({ type: 'income', transaction: null })} onDelete={(transaction) => void deleteTransaction(transaction)} onEdit={(transaction) => setSheet({ type: transaction.type, transaction })} onFiltersChange={setFilters} timezone={timezone} transactions={transactions.data ?? []} />
              <FinanceCharts currency={currency} overview={overview.data} />
              <CategoryManager categories={categories.data ?? []} userId={user?.id ?? ''} />
            </div> : null}
            {!overview.isLoading && !overview.data && !overview.isError ? <Card className="p-6 text-center"><CircleDollarSign aria-hidden="true" className="mx-auto size-6 text-teal-700 dark:text-teal-300" /><p className="mt-3 font-semibold text-[var(--foreground)]">Preparando tus finanzas.</p></Card> : null}
          </div>
        </main>
        {sheet ? <TransactionSheet categories={activeCategories} initialType={sheet.type} onClose={() => setSheet(null)} onSave={(input) => sheet.transaction ? transactionActions.update.mutateAsync({ transactionId: sheet.transaction.id, input }) : transactionActions.create.mutateAsync(input)} open period={period} saving={transactionActions.create.isPending || transactionActions.update.isPending} timezone={timezone} transaction={sheet.transaction} /> : null}
        <MarkPaymentSheet occurrence={markingPayment} onClose={() => setMarkingPayment(null)} onSave={(input) => paymentActions.markPaid.mutateAsync({ occurrenceId: markingPayment?.id ?? '', input })} saving={paymentActions.markPaid.isPending} timezone={timezone} />
      </IonContent>
    </IonPage>
  )
}