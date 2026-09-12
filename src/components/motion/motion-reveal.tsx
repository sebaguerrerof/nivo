import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const reducedMotion = useReducedMotion()

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(className)}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      transition={reducedMotion ? { duration: 0 } : { delay, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  )
}
