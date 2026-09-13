import { Activity, Gauge } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface DailyScoreCardProps {
  score: number
}

function getScoreMessage(score: number) {
  if (score >= 80) return 'Vas muy bien. Mantén el ritmo.'
  if (score >= 50) return 'Vas avanzando paso a paso.'
  if (score > 0) return 'Un pequeño avance cambia el día.'
  return 'Completa una actividad para empezar.'
}

export function DailyScoreCard({ score }: DailyScoreCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-amber-100/70 blur-3xl dark:bg-amber-950/30" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Gauge aria-hidden="true" className="size-4" />
            <p className="text-sm font-semibold">Daily Score</p>
          </div>
          <p className="mt-3 text-4xl font-bold tracking-[-0.06em] text-[var(--foreground)]">{score}<span className="ml-1 text-xl text-[var(--foreground-muted)]">/100</span></p>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{getScoreMessage(score)}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <Activity aria-hidden="true" className="size-5" />
        </div>
      </div>
      <div aria-label={`Daily Score ${score} de 100`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={score} className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar">
        <div className="h-full rounded-full bg-amber-500 transition-[width] duration-300" style={{ width: `${score}%` }} />
      </div>
    </Card>
  )
}
