import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-[var(--radius-card)] transition-colors duration-200', {
  variants: {
    variant: {
      default: 'border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-card)]',
      elevated: 'border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)]',
      subtle: 'border border-transparent bg-[var(--surface-subtle)] shadow-none',
      ghost: 'border border-transparent bg-transparent shadow-none',
      interactive: 'border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-elevated)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface CardProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <section className={cn(cardVariants({ variant }), className)} {...props} />
}