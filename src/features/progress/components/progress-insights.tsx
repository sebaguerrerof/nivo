import { Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { ProgressInsight } from '@/features/progress/progress.types'

export function ProgressInsights({ insights }: { insights: ProgressInsight[] }) {
  const visibleInsights = insights.slice(0, 3)
  const additionalInsights = insights.slice(3)

  return (
    <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Lightbulb aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Lo que se observa</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Lecturas descriptivas basadas en tus registros.</p></div></div>{insights.length ? <><ul className="mt-5 grid gap-3">{visibleInsights.map((insight) => <li className={`rounded-[var(--radius-control)] border px-4 py-3 text-sm leading-6 ${insight.tone === 'positive' ? 'border-teal-100 bg-teal-50/60 text-teal-950 dark:border-teal-900/60 dark:bg-teal-950/25 dark:text-teal-100' : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)]'}`} key={insight.id}>{insight.text}</li>)}</ul>{additionalInsights.length ? <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-teal-700 outline-none hover:text-teal-800 focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-teal-300 dark:hover:text-teal-200">Ver más observaciones</summary><ul className="mt-3 grid gap-3">{additionalInsights.map((insight) => <li className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground-muted)]" key={insight.id}>{insight.text}</li>)}</ul></details> : null}</> : <p className="mt-5 text-sm text-[var(--foreground-muted)]">Sigue registrando días para descubrir tus patrones de planificación.</p>}</Card>
  )
}