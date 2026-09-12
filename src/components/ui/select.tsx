import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  label: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ id, label, error, className, children, ...props }, ref) {
  const selectId = id ?? props.name

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]" htmlFor={selectId}>
      {label}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'min-h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-base text-[var(--foreground)] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-rose-500' : 'border-[var(--border)]',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span id={`${selectId}-error`} className="text-xs font-normal text-rose-600 dark:text-rose-400">
          {error}
        </span>
      ) : null}
    </label>
  )
})

Select.displayName = 'Select'