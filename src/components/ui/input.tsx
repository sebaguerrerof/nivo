import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  endAdornment?: ReactNode
  error?: string
  label: string
}

export function Input({ id, label, error, className, endAdornment, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]" htmlFor={inputId}>
      {label}
      <span className="relative block">
        <input
          id={inputId}
          className={cn(
            'min-h-12 w-full rounded-xl border bg-[var(--surface)] px-3.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-60',
            endAdornment ? 'pr-12' : '',
            error ? 'border-rose-500' : 'border-[var(--border)]',
            className,
          )}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {endAdornment ? <span className="absolute inset-y-0 right-1.5 flex items-center">{endAdornment}</span> : null}
      </span>
      {error ? (
        <span id={`${inputId}-error`} className="text-xs font-normal text-rose-600 dark:text-rose-400">
          {error}
        </span>
      ) : null}
    </label>
  )
}
