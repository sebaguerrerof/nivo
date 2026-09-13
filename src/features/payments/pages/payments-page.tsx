import { IonContent, IonPage } from '@ionic/react'
import { AlertCircle, CalendarClock, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { FinanceMonthNavigator } from '@/features/finances/components/finance-month-navigator'
import { useFinancialCategories } from '@/features/finances/hooks/use-finances'
import { formatFinanceMonth, getCurrentFinanceMonth } from '@/features/finances/finance.utils'
import { MarkPaymentSheet } from '@/features/payments/components/mark-payment-sheet'
import { PaymentOccurrenceList } from '@/features/payments/components/payment-occurrence-list'
import { RecurringPaymentSheet } from '@/features/payments/components/recurring-payment-sheet'
import { TherapyPaymentCard } from '@/features/payments/components/therapy-payment-card'
import { UpcomingPaymentsCard } from '@/features/payments/components/upcoming-payments-card'
import { usePaymentActions, usePaymentOccurrences, useRecurringPayments } from '@/features/payments/hooks/use-payments'
import { getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence, RecurringPayment } from '@/features/payments/payment.types'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useProfile } from '@/hooks/use-profile'

export function PaymentsPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const currency = profile?.currency || 'CLP'
  const [period, setPeriod] = useState(() => getCurrentFinanceMonth(timezone))
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null | undefined>(undefined)
  const [markingPayment, setMarkingPayment] = useState<PaymentOccurrence | null>(null)
  const recurring = useRecurringPayments(user?.id, true)
  const occurrences = usePaymentOccurrences(user?.id, period)

  const categories = useFinancialCategories(user?.id, true)
  const actions = usePaymentActions(user?.id ?? '')
  const today = getTodayInTimeZone(timezone)

  const monthPayments = useMemo(() => occurrences.data ?? [], [occurrences.data])
  const openMonthPayments = useMemo(() => monthPayments
    .filter((payment) => !['paid', 'skipped'].includes(getPaymentOccurrenceStatus(payment, today)))
    .sort((left, right) => {
      const priority = (payment: PaymentOccurrence) => getPaymentOccurrenceStatus(payment, today) === 'overdue' ? 0 : getPaymentOccurrenceStatus(payment, today) === 'pending' ? 1 : 2
      return priority(left) - priority(right) || left.due_date.localeCompare(right.due_date)
    }), [monthPayments, today])
  const pending = useMemo(() => openMonthPayments.filter((payment) => getPaymentOccurrenceStatus(payment, today) !== 'overdue'), [openMonthPayments, today])
  const history = useMemo(() => monthPayments.filter((payment) => ['paid', 'skipped'].includes(getPaymentOccurrenceStatus(payment, today))), [monthPayments, today])
  const overduePayments = useMemo(() => openMonthPayments.filter((payment) => getPaymentOccurrenceStatus(payment, today) === 'overdue'), [openMonthPayments, today])
  const recurringPayments = recurring.data ?? []

  const undoPayment = async (payment: PaymentOccurrence) => {
    if (!window.confirm(`¿Deshacer el pago de “${payment.recurring_payment?.name ?? 'este pago'}”? Solo se eliminará el gasto automático creado por Nivo.`)) return
    try {
      await actions.undo.mutateAsync(payment.id)
    } catch {
      window.alert('No pudimos deshacer este pago. Intenta nuevamente.')
    }
  }

  const setActive = async (payment: RecurringPayment, active: boolean) => {
    try {
      await actions.setActive.mutateAsync({ paymentId: payment.id, active })
    } catch {
      window.alert('No pudimos actualizar este pago. Intenta nuevamente.')
    }
  }

  const deletePayment = async (payment: RecurringPayment) => {
    if (!window.confirm(`¿Eliminar “${payment.name}” y sus registros asociados? Se borrarán sus ocurrencias y los gastos automáticos creados por Nivo. Esta acción no se puede deshacer.`)) return
    try {
      await actions.remove.mutateAsync(payment.id)
    } catch (error) {
      const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : ''
      window.alert(message || 'No pudimos eliminar este pago. Intenta nuevamente.')
    }
  }

  const isLoading = recurring.isLoading || occurrences.isLoading || categories.isLoading
  const isError = recurring.isError || occurrences.isError || categories.isError

  return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-6xl"><header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[var(--foreground-muted)]">Compromisos claros, sin sorpresas</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Pagos recurrentes</h1><p className="mt-2 max-w-2xl text-[15px] text-[var(--foreground-muted)]">Registra lo que se repite, confirma cuando se paga y mantén tu disponible real a la vista.</p></div><FinanceMonthNavigator onChange={setPeriod} value={period} /></header><div className="mb-6 flex flex-wrap gap-3"><Button onClick={() => setEditingPayment(null)} type="button"><Plus aria-hidden="true" className="size-4" />Agregar pago</Button></div>{isError ? <Alert variant="error">No pudimos cargar tus pagos. Actualiza la página e inténtalo nuevamente.</Alert> : null}{isLoading ? <section className="grid gap-5 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Card className="h-44 animate-pulse bg-[var(--surface-muted)]" key={index} />)}</section> : <div className="grid gap-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><TherapyPaymentCard currency={currency} onMarkPaid={setMarkingPayment} payments={openMonthPayments} timezone={timezone} /><UpcomingPaymentsCard currency={currency} emptyMessage={`No tienes pagos pendientes en ${formatFinanceMonth(period).toLocaleLowerCase('es-CL')}.`} onMarkPaid={setMarkingPayment} payments={openMonthPayments} title={`Pagos de ${formatFinanceMonth(period)}`} timezone={timezone} /></div>{overduePayments.length > 0 ? <Alert variant="error"><AlertCircle aria-hidden="true" className="size-4" />Tienes pagos vencidos. Resolverlos actualizará tus finanzas automáticamente.</Alert> : null}<PaymentOccurrenceList currency={currency} emptyMessage="No tienes pagos vencidos." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={overduePayments} savingId={actions.undo.variables} timezone={timezone} title="Vencidos" /><PaymentOccurrenceList currency={currency} emptyMessage="No hay pagos pendientes en este mes." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={pending} savingId={actions.undo.variables} timezone={timezone} title="Próximos y pendientes del mes" /><PaymentOccurrenceList currency={currency} emptyMessage="Todavía no hay pagos registrados en este mes." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={history} savingId={actions.undo.variables} timezone={timezone} title="Historial del mes" /><Card className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><CalendarClock aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Tus obligaciones</p></div><h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Pagos que Nivo seguirá por ti</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Pausar deja el historial intacto y detiene las próximas ocurrencias.</p></div><Button onClick={() => setEditingPayment(null)} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar</Button></div>{recurringPayments.length === 0 ? <div className="mt-5 rounded-xl bg-[var(--surface-muted)] px-4 py-7 text-sm text-[var(--foreground-muted)]"><p>Todavía no tienes pagos recurrentes.</p><p className="mt-1">Puedes comenzar con terapia, gimnasio, teléfono o arriendo.</p><Button className="mt-4" onClick={() => setEditingPayment(null)} size="sm" type="button">Crear mi primer pago</Button></div> : <div className="mt-5 grid gap-3">{recurringPayments.map((payment) => <article className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between" key={payment.id}><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--foreground)]">{payment.name}</p><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${payment.active ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' : 'bg-[var(--surface-muted)] text-[var(--foreground-muted)]'}`}>{payment.active ? 'Activo' : 'Pausado'}</span></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">{payment.category?.name ?? 'Sin categoría'} · próximo {payment.next_due_date}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setEditingPayment(payment)} size="sm" type="button" variant="ghost">Editar</Button><Button loading={actions.setActive.isPending && actions.setActive.variables?.paymentId === payment.id} onClick={() => void setActive(payment, !payment.active)} size="sm" type="button" variant="secondary">{payment.active ? <><Pause aria-hidden="true" className="size-3.5" />Pausar</> : <><Play aria-hidden="true" className="size-3.5" />Reanudar</>}</Button><Button loading={actions.remove.isPending && actions.remove.variables === payment.id} onClick={() => void deletePayment(payment)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600 dark:text-rose-300" />Eliminar</Button></div></article>)}</div>}</Card></div>}</div></main>{editingPayment !== undefined ? <RecurringPaymentSheet categories={categories.data ?? []} onClose={() => setEditingPayment(undefined)} onSave={(input) => editingPayment ? actions.update.mutateAsync({ paymentId: editingPayment.id, input }) : actions.create.mutateAsync(input)} payment={editingPayment} saving={actions.create.isPending || actions.update.isPending} timezone={timezone} /> : null}<MarkPaymentSheet occurrence={markingPayment} onClose={() => setMarkingPayment(null)} onSave={(input) => actions.markPaid.mutateAsync({ occurrenceId: markingPayment?.id ?? '', input })} saving={actions.markPaid.isPending} timezone={timezone} /></IonContent></IonPage>
}