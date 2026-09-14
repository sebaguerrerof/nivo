import { Tags } from 'lucide-react'
import { getCategoryLabel } from '@/features/progress/progress.utils'
import type { CategoryStat } from '@/features/progress/progress.types'

export function CategoryProgress({ categories }: { categories: CategoryStat[] }) {
  return (
    <section className="border-t border-[var(--border-subtle)] pt-7">
      <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"><Tags aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Dónde estás siendo más constante</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Una lectura simple de tus categorías.</p></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => <div key={category.category}><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-[var(--foreground)]">{getCategoryLabel(category.category)}</span><span className="font-semibold text-[var(--foreground-muted)]">{category.percentage}%</span></div><div aria-label={`${getCategoryLabel(category.category)}: ${category.percentage}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={category.percentage} className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className="h-full rounded-full bg-[var(--chart-primary)]" style={{ width: `${category.percentage}%` }} /></div><p className="mt-1 text-xs text-[var(--foreground-subtle)]">{category.completed} de {category.planned} actividades</p></div>)}
      </div>
    </section>
  )
}