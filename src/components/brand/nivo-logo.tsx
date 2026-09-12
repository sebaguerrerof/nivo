import { cn } from '@/lib/utils'

interface NivoLogoProps {
  className?: string
  compact?: boolean
  inverted?: boolean
}

export function NivoLogo({ className, compact = false, inverted = false }: NivoLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-lg font-bold tracking-tighter text-white shadow-sm shadow-teal-950/25">
        N
      </span>
      {!compact ? <span className={cn('text-lg font-bold tracking-[-0.03em]', inverted ? 'text-white' : 'text-[var(--foreground)]')}>Nivo</span> : null}
    </div>
  )
}
