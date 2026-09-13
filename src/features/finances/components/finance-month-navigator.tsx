import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFinanceMonth, getAdjacentFinanceMonth } from '@/features/finances/finance.utils'
import type { FinanceMonth } from '@/features/finances/finance.types'

interface FinanceMonthNavigatorProps {
  value: FinanceMonth
  onChange: (period: FinanceMonth) => void
}

export function FinanceMonthNavigator({ value, onChange }: FinanceMonthNavigatorProps) {
  return (
    <div aria-label="Seleccionar mes financiero" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
      <Button aria-label="Mes anterior" onClick={() => onChange(getAdjacentFinanceMonth(value, -1))} size="icon" type="button" variant="ghost">
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>
      <p aria-live="polite" className="min-w-44 px-2 text-center text-sm font-semibold text-[var(--foreground)]">{formatFinanceMonth(value)}</p>
      <Button aria-label="Mes siguiente" onClick={() => onChange(getAdjacentFinanceMonth(value, 1))} size="icon" type="button" variant="ghost">
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}
