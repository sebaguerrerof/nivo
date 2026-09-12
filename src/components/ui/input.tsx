import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label: string
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={cn(
          'min-h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-rose-500' : 'border-[var(--border)]',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs font-normal text-rose-600 dark:text-rose-400">
          {error}
        </span>
      ) : null}
    </label>
  )
}
