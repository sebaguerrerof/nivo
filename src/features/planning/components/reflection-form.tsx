import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Heart } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { reflectionSchema, type ReflectionFormValues } from '@/features/planning/planning.schemas'
import { formatClosedAt } from '@/features/planning/planning.utils'
import type { DailyPlan, DailyReflection, ReflectionInput } from '@/types/planning'

interface ReflectionFormProps {
  isPending: boolean
  plan: DailyPlan
  reflection: DailyReflection | null
  timezone: string
  onClose: (input: ReflectionInput) => Promise<unknown>
}

export function ReflectionForm({ isPending, plan, reflection, timezone, onClose }: ReflectionFormProps) {
  const form = useForm<ReflectionFormValues>({ resolver: zodResolver(reflectionSchema) })
  const closed = Boolean(plan.closed_at)

  useEffect(() => {
    form.reset({ whatWentWell: reflection?.what_went_well ?? '', whatToImprove: reflection?.what_to_improve ?? '', moodScore: reflection?.mood_score ?? '' })
  }, [form, reflection])

  const submit = form.handleSubmit(async (values) => {
    await onClose({ whatWentWell: values.whatWentWell, whatToImprove: values.whatToImprove, moodScore: values.moodScore === '' ? null : values.moodScore })
  })

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Heart aria-hidden="true" className="size-5" /></div><div><p className="font-bold text-[var(--foreground)]">{closed ? 'Tu día quedó cerrado' : 'Cierra tu día'}</p><p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{closed && plan.closed_at ? `Cerrado el ${formatClosedAt(plan.closed_at, timezone)}.` : 'Una reflexión breve puede ayudarte a terminar con intención.'}</p></div></div>
      <form className="mt-5 grid gap-4" noValidate onSubmit={submit}>
        <Textarea error={form.formState.errors.whatWentWell?.message} label="¿Qué salió bien?" rows={3} {...form.register('whatWentWell')} />
        <Textarea error={form.formState.errors.whatToImprove?.message} label="¿Qué podría mejorar?" rows={3} {...form.register('whatToImprove')} />
        <Input error={form.formState.errors.moodScore?.message} label="Ánimo (1 a 10, opcional)" max={10} min={1} type="number" {...form.register('moodScore')} />
        <div>{form.formState.errors.moodScore?.message ? <Alert variant="error">{form.formState.errors.moodScore.message}</Alert> : null}</div>
        <Button className="w-full sm:w-auto" loading={isPending} type="submit">{closed ? 'Actualizar reflexión' : 'Cerrar día'}</Button>
      </form>
    </Card>
  )
}
