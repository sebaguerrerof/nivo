import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 text-sm font-semibold tracking-[-0.01em] transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-teal-700 text-white shadow-md shadow-teal-900/15 hover:-translate-y-px hover:bg-teal-800 hover:shadow-lg hover:shadow-teal-900/15 active:translate-y-0 active:scale-[0.985]',
        secondary:
          'border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm hover:-translate-y-px hover:bg-[var(--surface-muted)] hover:shadow-md active:translate-y-0 active:scale-[0.985]',
        ghost: 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] active:scale-[0.985]',
        danger: 'bg-rose-600 text-white shadow-md shadow-rose-950/10 hover:-translate-y-px hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-950/10 active:translate-y-0 active:scale-[0.985]',
      },
      size: {
        default: '',
        sm: 'min-h-9 rounded-[0.875rem] px-3.5 text-xs',
        icon: 'size-11 rounded-[var(--radius-button)] p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
  children: ReactNode
}

export function Button({ className, variant, size, loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}
