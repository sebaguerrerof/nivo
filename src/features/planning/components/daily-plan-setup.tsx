import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dailyPlanSchema, type DailyPlanFormValues } from '@/features/planning/planning.schemas'
import type { DailyPlanInput } from '@/types/planning'

interface DailyPlanSetupProps {
  date: string
  isPending: boolean
  onCreate: (input: DailyPlanInput) => Promise<unknown>
}

export function DailyPlanSetup({ date, isPending, onCreate }: DailyPlanSetupProps) {
  const form = useForm<DailyPlanFormValues>({
    resolver: zodResolver(dailyPlanSchema),
    defaultValues: { date, wakeUpTime: '', dailyCommitment: '', notes: '' },
  })

  useEffect(() => form.setValue('date', date), [date, form])

  const onSubmit = form.handleSubmit(async (values) => {
    await onCreate({
      date: values.date,
      wakeUpTime: values.wakeUpTime || null,
      dailyCommitment: values.dailyCommitment,
      notes: values.notes,
    })
  })

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" />
      <div className="relative max-w-xl">
        <div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
          <CalendarPlus aria-hidden="true" className="size-5" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Crea tu día con calma.</h2>
        <p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">Parte por lo esencial. Objetivos y actividades se agregan después, sin un formulario interminable.</p>

        <form className="mt-7 grid gap-5" noValidate onSubmit={onSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input error={form.formState.errors.date?.message} label="Fecha" type="date" {...form.register('date')} />
            <Input error={form.formState.errors.wakeUpTime?.message} label="Hora de despertar (opcional)" type="time" {...form.register('wakeUpTime')} />
          </div>
          <Textarea error={form.formState.errors.dailyCommitment?.message} label="Compromiso del día (opcional)" placeholder="¿Qué quieres cuidar hoy?" rows={3} {...form.register('dailyCommitment')} />
          <Textarea error={form.formState.errors.notes?.message} label="Notas (opcional)" placeholder="Algo que quieras tener presente…" rows={3} {...form.register('notes')} />
          <Button className="w-full sm:w-auto" loading={isPending} type="submit">Crear mi día</Button>
        </form>
      </div>
    </Card>
  )
}
