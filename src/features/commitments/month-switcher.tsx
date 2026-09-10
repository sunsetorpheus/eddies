import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCommitments } from './commitments-store'
import { addMonths, earliestMonth, monthLabel, thisMonth } from './month'

export function MonthSwitcher() {
  const { month, setMonth, payments } = useCommitments()

  const earliest = earliestMonth(payments ?? [])
  const latest = addMonths(thisMonth(), 1) // one month ahead, for preview
  const canBack = month > earliest
  const canForward = month < latest

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium tabular-nums mr-1">
        {monthLabel(month)}
        {month > thisMonth() && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(Preview)</span>
        )}
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous month"
          disabled={!canBack}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next month"
          disabled={!canForward}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
