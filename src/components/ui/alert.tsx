import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps {
  children: ReactNode
  variant?: 'error' | 'success' | 'info'
}

const variants = {
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200',
}

export function Alert({ children, variant = 'info' }: AlertProps) {
  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div className={cn('flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm', variants[variant])} role="alert">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
