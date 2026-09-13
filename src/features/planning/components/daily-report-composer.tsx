import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Copy, FileText, Sparkles } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PlanDraftReview } from '@/features/planning/components/plan-from-text'
import { dailyReportFormSchema, type DailyReportFormValues, type GeneratedDailyReport } from '@/features/planning/daily-report.schemas'
import type { PlanDraft } from '@/features/planning/plan-draft.schemas'
import { getNextCalendarDate } from '@/features/planning/planning.utils'
import { dailyReportService } from '@/services/daily-report.service'
import type { DailyPlan } from '@/types/planning'

interface DailyReportComposerProps {
  isSavingNextPlan: boolean
  onCreateNextPlan: (draft: PlanDraft) => Promise<unknown>
  plan: DailyPlan
  timezone: string
}

interface PreparedDailyReport extends Omit<GeneratedDailyReport, 'plan'> {
  plan: PlanDraft
}

export function DailyReportComposer({ isSavingNextPlan, onCreateNextPlan, plan, timezone }: DailyReportComposerProps) {
  const tomorrowDate = getNextCalendarDate(plan.date)
  const form = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportFormSchema),
    defaultValues: { feelings: '', todaySummary: '', tomorrowPrompt: '' },
  })
  const [result, setResult] = useState<PreparedDailyReport | null>(null)
  const [reportText, setReportText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = form.handleSubmit(async (values) => {
    setError(null)
    setCopied(false)
    setIsGenerating(true)
    try {
      const generated = await dailyReportService.generate({
        ...values,
        planId: plan.id,
        tomorrowDate,
        timezone,
      })
      const prepared = { ...generated, plan: { ...generated.plan, date: tomorrowDate } }
      setResult(prepared)
      setReportText(generated.groupReport)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos preparar el reporte. Intenta nuevamente.')
    } finally {
      setIsGenerating(false)
    }
  })

  const copyReport = async () => {
    setError(null)
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
    } catch {
      setError('No pudimos copiar el mensaje. Selecciónalo y cópialo manualmente.')
    }
  }

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-sky-100/65 blur-3xl dark:bg-sky-950/30" />
      <div className="relative">
        {result ? (
          <div className="grid gap-6">
            <div>
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300"><Check aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Reporte listo para revisar</p></div>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Copia tu mensaje y confirma mañana.</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">El mensaje no se guarda ni se envía automáticamente.</p>
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <Textarea label="Mensaje para tu grupo" onChange={(event) => setReportText(event.target.value)} rows={16} value={reportText} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => void copyReport()} type="button" variant="secondary"><Copy aria-hidden="true" className="size-4" />{copied ? 'Mensaje copiado' : 'Copiar mensaje'}</Button>
              <Button onClick={() => { setResult(null); setReportText(''); setCopied(false); form.reset() }} type="button" variant="ghost">Empezar de nuevo</Button>
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <PlanDraftReview draft={result.plan} isSaving={isSavingNextPlan} onCancel={() => { setResult(null); setReportText(''); setCopied(false); form.reset() }} onSave={onCreateNextPlan} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><FileText aria-hidden="true" className="size-5" /></div>
              <div>
                <p className="font-bold text-[var(--foreground)]">Reporte y plan de mañana</p>
                <p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">Convierte tu cierre en un mensaje editable y prepara el {tomorrowDate}.</p>
              </div>
            </div>

            {error ? <div className="mt-5"><Alert variant="error">{error}</Alert></div> : null}

            <form className="mt-5 grid gap-4" noValidate onSubmit={generate}>
              <Textarea error={form.formState.errors.feelings?.message} label="¿Cómo te sentiste durante el día?" placeholder="Cuéntalo con tus palabras, sin obligación de compartir más de lo que quieras." rows={4} {...form.register('feelings')} />
              <Textarea error={form.formState.errors.todaySummary?.message} label="¿Qué hiciste y qué quedó pendiente?" placeholder="Menciona avances, actividades que no resultaron y lo que quieras contar." rows={4} {...form.register('todaySummary')} />
              <Textarea error={form.formState.errors.tomorrowPrompt?.message} label="Describe cómo quieres organizar mañana" placeholder="Mañana me despertaré a las 07:30, leeré la Biblia, me ducharé, trabajaré y haré deporte…" rows={5} {...form.register('tomorrowPrompt')} />
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm leading-5 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/35 dark:text-sky-100"><span className="font-semibold">Privacidad.</span> Al generar, se envían a OpenAI este formulario y los datos de este día para crear el borrador. Nivo no guarda el reporte ni lo envía a WhatsApp.</div>
              <Button className="w-full sm:w-auto" loading={isGenerating} type="submit"><Sparkles aria-hidden="true" className="size-4" />Generar reporte y plan</Button>
            </form>
          </>
        )}
      </div>
    </Card>
  )
}
