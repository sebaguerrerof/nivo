import { Card } from '@/components/ui/card'

export function PlanningSkeleton() {
  return <div className="grid gap-5"><div className="h-9 w-48 animate-pulse rounded-lg bg-[var(--surface-muted)]" /><Card className="h-44 animate-pulse bg-[var(--surface-muted)]" /><Card className="h-64 animate-pulse bg-[var(--surface-muted)]" /></div>
}
