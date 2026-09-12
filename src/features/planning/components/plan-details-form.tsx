import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dailyPlanSchema, type DailyPlanFormValues } from '@/features/planning/planning.schemas'
import { normalizeTime } from '@/features/planning/planning.utils'
import type { DailyPlan, DailyPlanInput } from '@/types/planning'

interface PlanDetailsFormProps {
  plan: DailyPlan
  isPending: boolean
  onSave: (input: DailyPlanInput) => Promise<unknown>
}

export function PlanDetailsForm({ plan, isPending, onSave }: PlanDetailsFormProps) {
  const form = useForm<DailyPlanFormValues>({ resolver: zodResolver(dailyPlanSchema) })

  useEffect(() => {
    form.reset({
      date: plan.date,
      wakeUpTime: normalizeTime(plan.wake_up_time),
      dailyCommitment: plan.daily_commitment ?? '',
      notes: plan.notes ?? '',
    })
  }, [form, plan])

  const onSubmit = form.handleSubmit(async (values) => {
    await onSave({ date: values.date, wakeUpTime: values.wakeUpTime || null, dailyCommitment: values.dailyCommitment, notes: values.notes })
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
        <Textarea error={form.formState.errors.notes?.message} label="Notas" rows={3} {...form.register('notes')} />
        <Button className="w-full sm:w-auto" loading={isPending} type="submit" variant="secondary">Guardar cambios</Button>
      </form>
    </details>
  )
}
