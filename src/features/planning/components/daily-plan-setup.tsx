import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PlanFromText } from '@/features/planning/components/plan-from-text'
import { Textarea } from '@/components/ui/textarea'
import { dailyPlanSchema, type DailyPlanFormValues } from '@/features/planning/planning.schemas'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'
import type { DailyPlanInput } from '@/types/planning'

interface DailyPlanSetupProps {
  date: string
  isPending: boolean
  isSavingDraft: boolean
  onDateChange: (date: string) => void
  onCreate: (input: DailyPlanInput) => Promise<unknown>
  onCreateFromDraft: (draft: PlanDraft) => Promise<unknown>
  onGenerateDraft: (prompt: string) => Promise<PlanDraft>
  timezone: string
}

export function DailyPlanSetup({ date, isPending, isSavingDraft, onDateChange, onCreate, onCreateFromDraft, onGenerateDraft, timezone }: DailyPlanSetupProps) {
  const form = useForm<DailyPlanFormValues>({
    resolver: zodResolver(dailyPlanSchema),
    defaultValues: { date, wakeUpTime: '', recoveryActivity: '', responsibilities: '', familyConnection: '', mainRisk: '', riskStrategy: '', dailyCommitment: '', notes: '' },
  })

  useEffect(() => form.setValue('date', date), [date, form])

  const onSubmit = form.handleSubmit(async (values) => {
    await onCreate({
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
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start">
      <PlanFromText date={date} isSaving={isSavingDraft} onDateChange={onDateChange} onGenerate={onGenerateDraft} onSave={onCreateFromDraft} timezone={timezone} />
      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" />
        <div className="relative max-w-xl">
          <div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CalendarPlus aria-hidden="true" className="size-5" /></div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">O créalo manualmente.</h2>
          <p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">Parte por lo esencial. Luego puedes completar el resto de la estructura desde los detalles del día.</p>

          <form className="mt-7 grid gap-5" noValidate onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <Input error={form.formState.errors.date?.message} label="Fecha" type="date" {...form.register('date')} />
              <Input error={form.formState.errors.wakeUpTime?.message} label="Hora de despertar (opcional)" type="time" {...form.register('wakeUpTime')} />
            </div>
            <Textarea error={form.formState.errors.dailyCommitment?.message} label="Compromiso del día (opcional)" placeholder="¿Qué quieres cuidar hoy?" rows={3} {...form.register('dailyCommitment')} />
            <Textarea error={form.formState.errors.notes?.message} label="Notas (opcional)" placeholder="Algo que quieras tener presente…" rows={3} {...form.register('notes')} />
            <Button className="w-full" loading={isPending} type="submit">Crear mi día</Button>
          </form>
        </div>
      </Card>
    </div>
  )
}