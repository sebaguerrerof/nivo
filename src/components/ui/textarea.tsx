import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ id, label, error, className, ...props }, ref) {
  const textareaId = id ?? props.name

  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--foreground)]" htmlFor={textareaId}>
      {label}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'min-h-24 w-full resize-y rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-rose-500' : 'border-[var(--border)]',
          className,
        )}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-rose-600 dark:text-rose-400" id={`${textareaId}-error`}>{error}</span> : null}
    </label>
  )
})

Textarea.displayName = 'Textarea'