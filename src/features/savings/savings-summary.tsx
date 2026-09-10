import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatMoney } from '@/lib/utils'
import { Bar } from '@/components/ui/bar'
import { useCommitments } from '@/features/commitments/commitments-store'
import { goalProgress, totalSaved } from './goal'

/** Dashboard section: total saved plus a bar per open goal. Hidden when there are no goals. */
export function SavingsSummary() {
  const { goals, contributions } = useCommitments()
  if (goals === undefined || contributions === undefined || goals.length === 0) return null

  const withProgress = goals.map((g) => ({ g, p: goalProgress(g, contributions) }))
  const open = withProgress.filter((x) => !x.p.done)

  return (
    <Link
      to="/savings"
      className="block space-y-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Saved
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {formatMoney(totalSaved(contributions))}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      {open.length > 0 ? (
        <ul className="space-y-2">
          {open.slice(0, 4).map(({ g, p }) => (
            <li key={g.id} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span className="truncate">{g.name}</span>
                <span>
                  {formatMoney(p.saved)} / {formatMoney(g.target)}
                </span>
              </div>
              <Bar pct={p.pct} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">All goals reached.</p>
      )}
    </Link>
  )
}
