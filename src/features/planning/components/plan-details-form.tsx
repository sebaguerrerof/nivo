import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dailyPlanSchema, type DailyPlanFormValues } from '@/features/planning/planning.schemas'
import { normalizeTime } from '@/features/planning/planning.utils'
import type { DailyPlan, DailyPlanInput } from '@/types/planning'

interface PlanDetailsFormProps {
  plan: DailyPlan
  isDeleting: boolean
  isPending: boolean
  onDelete: () => Promise<unknown>
  onSave: (input: DailyPlanInput) => Promise<unknown>
}

export function PlanDetailsForm({ plan, isDeleting, isPending, onDelete, onSave }: PlanDetailsFormProps) {
  const form = useForm<DailyPlanFormValues>({ resolver: zodResolver(dailyPlanSchema) })
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    form.reset({
      date: plan.date,
      wakeUpTime: normalizeTime(plan.wake_up_time),
      recoveryActivity: plan.recovery_activity ?? '',
      responsibilities: plan.responsibilities ?? '',
      familyConnection: plan.family_connection ?? '',
      mainRisk: plan.main_risk ?? '',
      riskStrategy: plan.risk_strategy ?? '',
      dailyCommitment: plan.daily_commitment ?? '',
      notes: plan.notes ?? '',
    })
    setIsConfirmingDelete(false)
  }, [form, plan])

  const confirmDelete = async () => {
    try {
      await onDelete()
    } catch {
      // La pantalla principal ya comunica el error y mantiene el día intacto.
    }
  }
  const onSubmit = form.handleSubmit(async (values) => {
    await onSave({
      date: values.date,
      wakeUpTime: values.wakeUpTime || null,
      recoveryActivity: values.recoveryActivity,
      responsibilities: values.responsibilities,
      familyConnection: values.familyConnection,
      mainRisk: values.mainRisk,
      riskStrategy: values.riskStrategy,
      dailyCommitment: values.dailyCommitment,
      notes: values.notes,
    })
  })

  return (
    <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-card)]">
      <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:hidden">Editar información del día</summary>
      <form className="mt-5 grid gap-4" noValidate onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input error={form.formState.errors.date?.message} label="Fecha" type="date" {...form.register('date')} />
          <Input error={form.formState.errors.wakeUpTime?.message} label="Hora de despertar" type="time" {...form.register('wakeUpTime')} />
        </div>
        <Textarea error={form.formState.errors.dailyCommitment?.message} label="Compromiso del día" rows={2} {...form.register('dailyCommitment')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea error={form.formState.errors.recoveryActivity?.message} label="Recuperación obligatoria" rows={3} {...form.register('recoveryActivity')} />
          <Textarea error={form.formState.errors.responsibilities?.message} label="Responsabilidades" rows={3} {...form.register('responsibilities')} />
          <Textarea error={form.formState.errors.familyConnection?.message} label="Familia o personas" rows={3} {...form.register('familyConnection')} />
          <Textarea error={form.formState.errors.mainRisk?.message} label="Riesgo principal" rows={3} {...form.register('mainRisk')} />
        </div>
        <Textarea error={form.formState.errors.riskStrategy?.message} label="Cómo enfrentaré el riesgo" rows={3} {...form.register('riskStrategy')} />
        <Textarea error={form.formState.errors.notes?.message} label="Notas" rows={3} {...form.register('notes')} />
        <Button className="w-full sm:w-auto" loading={isPending} type="submit" variant="secondary">Guardar cambios</Button>
      </form>

      <div className="mt-6 border-t border-rose-200 pt-5 dark:border-rose-900/60">
        <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Rehacer este día</h3>
        <p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">Al eliminarlo se borrarán sus objetivos, actividades y cierre. No se puede deshacer.</p>
        {!isConfirmingDelete ? <Button className="mt-3" onClick={() => setIsConfirmingDelete(true)} size="sm" type="button" variant="danger"><Trash2 aria-hidden="true" className="size-3.5" />Eliminar este día</Button> : <div className="mt-3 grid gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/70 dark:bg-rose-950/35"><Alert variant="error">¿Seguro que quieres eliminar este día completo?</Alert><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)} size="sm" type="button" variant="ghost">Cancelar</Button><Button loading={isDeleting} onClick={confirmDelete} size="sm" type="button" variant="danger">Sí, eliminar día</Button></div></div>}
      </div>
    </details>
  )
}