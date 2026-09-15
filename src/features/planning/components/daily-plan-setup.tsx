import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarPlus, Sparkles } from 'lucide-react'
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
  const form = useForm<DailyPlanFormValues>({ resolver: zodResolver(dailyPlanSchema), defaultValues: { date, wakeUpTime: '', recoveryActivity: '', responsibilities: '', familyConnection: '', mainRisk: '', riskStrategy: '', dailyCommitment: '', notes: '' } })
  useEffect(() => form.setValue('date', date), [date, form])
  const onSubmit = form.handleSubmit(async (values) => {
    await onCreate({ date: values.date, wakeUpTime: values.wakeUpTime || null, recoveryActivity: values.recoveryActivity, responsibilities: values.responsibilities, familyConnection: values.familyConnection, mainRisk: values.mainRisk, riskStrategy: values.riskStrategy, dailyCommitment: values.dailyCommitment, notes: values.notes })
  })

  return <section><div className="mb-6 max-w-xl"><p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 dark:text-teal-200"><CalendarPlus aria-hidden="true" className="size-4" />Un nuevo día</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]">Aún no has planificado este día.</h2><p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">Empieza por lo esencial. Puedes crearlo manualmente o pedir ayuda a la IA cuando la necesites.</p></div><div className="grid gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:items-start"><Card className="relative overflow-hidden p-5 sm:p-6"><div aria-hidden="true" className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" /><div className="relative"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CalendarPlus aria-hidden="true" className="size-5" /></div><h3 className="mt-5 text-xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Crear manualmente</h3><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Solo necesitas una hora de inicio y una intención para comenzar.</p><form className="mt-6 grid gap-5" noValidate onSubmit={onSubmit}><Input error={form.formState.errors.date?.message} label="Fecha" type="date" {...form.register('date')} /><Input error={form.formState.errors.wakeUpTime?.message} label="Hora de despertar (opcional)" type="time" {...form.register('wakeUpTime')} /><Textarea error={form.formState.errors.dailyCommitment?.message} label="Compromiso del día (opcional)" placeholder="¿Qué quieres cuidar hoy?" rows={3} {...form.register('dailyCommitment')} /><Textarea error={form.formState.errors.notes?.message} label="Notas (opcional)" placeholder="Algo que quieras tener presente…" rows={3} {...form.register('notes')} /><Button className="w-full" loading={isPending} type="submit">Crear mi día</Button></form></div></Card><div><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground-muted)]"><Sparkles aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />Asistencia opcional</div><PlanFromText date={date} isSaving={isSavingDraft} onDateChange={onDateChange} onGenerate={onGenerateDraft} onSave={onCreateFromDraft} timezone={timezone} /></div></div></section>
}