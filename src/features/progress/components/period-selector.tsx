import { Button } from '@/components/ui/button'
import { progressPeriods, type ProgressPeriod } from '@/features/progress/progress.types'

const labels: Record<ProgressPeriod, string> = { 7: '7 días', 30: '30 días', 90: '90 días' }

interface PeriodSelectorProps {
  value: ProgressPeriod
  onChange: (period: ProgressPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div aria-label="Seleccionar período" className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-sm" role="group">
      {progressPeriods.map((period) => (
        <Button aria-pressed={value === period} className="min-h-9 px-2 text-xs sm:px-3" key={period} onClick={() => onChange(period)} size="sm" variant={value === period ? 'primary' : 'ghost'}>
          {labels[period]}
        </Button>
      ))}
    </div>
  )
}