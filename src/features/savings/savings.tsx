import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bar } from '@/components/ui/bar'
import { useCommitments } from '@/features/commitments/commitments-store'
import { monthLabel } from '@/features/commitments/month'
import { goalProgress, totalSaved } from './goal'
import type { SavingsGoal } from './types'

export function Savings() {
  const { goals, contributions, month } = useCommitments()

  const loading = goals === undefined || contributions === undefined
  const all = goals ?? []

  // open goals first, achieved ones after
  const sorted = [...all].sort((a, b) => {
    const done = (g: SavingsGoal) =>
      goalProgress(g, contributions ?? []).done ? 1 : 0
    return done(a) - done(b)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Savings</h1>
        <Button asChild size="icon-sm" aria-label="Add goal">
          <Link to="/savings/new">
            <Plus />
          </Link>
        </Button>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : all.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatMoney(totalSaved(contributions ?? []))} saved across {all.length}{' '}
            {all.length === 1 ? 'goal' : 'goals'}
          </p>

          <ul className="space-y-3">
            {sorted.map((g) => (
              <GoalCard key={g.id} goal={g} month={month} />
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Log what you set aside each month. {monthLabel(month)} shown.
          </p>
        </>
      )}
    </div>
  )
}

function GoalCard({ goal, month }: { goal: SavingsGoal; month: string }) {
  const { contributions, setContribution } = useCommitments()
  const p = goalProgress(goal, contributions ?? [])
  const thisMonthAmount =
    (contributions ?? []).find((c) => c.goal_id === goal.id && c.month === month)?.amount ?? null

  const [value, setValue] = useState(thisMonthAmount != null ? String(thisMonthAmount) : '')
  const [busy, setBusy] = useState(false)
  const changed = (value.trim() === '' ? null : Number(value)) !== thisMonthAmount

  async function save() {
    const num = value.trim() === '' ? null : Number(value)
    if (num != null && (!Number.isFinite(num) || num < 0)) {
      toast.error('Enter a valid amount.')
      return
    }
    setBusy(true)
    try {
      await setContribution(goal.id, month, num)
      toast.success(num ? 'Contribution saved.' : 'Contribution cleared.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/savings/${goal.id}`} className="min-w-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="truncate">{goal.name}</span>
            {p.done && <Check className="size-4 shrink-0 text-paid" aria-label="achieved" />}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatMoney(p.saved)} of {formatMoney(goal.target)}
            {goal.target_date && ` · by ${monthLabel(goal.target_date)}`}
          </span>
        </Link>
        <span className="shrink-0 text-sm font-medium tabular-nums">{p.pct}%</span>
      </div>

      <Bar pct={p.pct} />

      {!p.done && (
        <>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={`Added in ${monthLabel(month).split(' ')[0]}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8"
            />
            <Button size="sm" onClick={save} disabled={busy || !changed}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatMoney(p.remaining)} to go
            {p.projectedFinishLabel && ` · on track for ${p.projectedFinishLabel}`}
          </p>
        </>
      )}
    </li>
  )
}

function ListSkeleton() {
  return (
    <ul className="space-y-3">
      {[0, 1].map((i) => (
        <li key={i} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">No savings goals yet</h2>
        <p className={cn('mx-auto max-w-xs text-sm text-muted-foreground')}>
          An emergency fund, a holiday, a new laptop — set a target, log what you save each month.
        </p>
      </div>
      <Button asChild>
        <Link to="/savings/new">Add your first goal</Link>
      </Button>
    </div>
  )
}
