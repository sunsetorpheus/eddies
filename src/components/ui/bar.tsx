import { cn } from '@/lib/utils'

/** A thin progress track. Animates via GPU transform (scaleX), not width. */
export function Bar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full origin-left rounded-full bg-paid transition-transform duration-300 ease-out',
          className,
        )}
        style={{ transform: `scaleX(${Math.max(0, Math.min(pct, 100)) / 100})` }}
      />
    </div>
  )
}
