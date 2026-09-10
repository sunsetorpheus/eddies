import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCommitments } from './commitments-store'
import { CommitmentRow } from './commitment-row'
import { CommitmentsSummary } from './summary'
import { MonthSwitcher } from './month-switcher'
import { createdMonth, statusFor, monthLabel, thisMonth, type Status } from './month'
import { CATEGORIES, type Category } from './types'

const STATUS_ORDER: Record<Status, number> = {
  overdue: 0,
  upcoming: 1,
  unpaid: 2,
  paid: 3,
  none: 4,
}

export function Commitments() {
  const { commitments, payments, month, markPaid, unmarkPaid } = useCommitments()
  const [busyId, setBusyId] = useState<string | null>(null)

  const all = commitments ?? []
  const isFuture = month > thisMonth()
  const paused = all.filter((c) => !c.active)
  const active = all.filter((c) => c.active && createdMonth(c) <= month)

  const overdueCount = active.filter(
    (c) => statusFor(c, month, payments ?? []) === 'overdue',
  ).length

  async function toggle(id: string, isPaid: boolean) {
    setBusyId(id)
    try {
      if (isPaid) await unmarkPaid(id, month)
      else await markPaid(id, month)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update.')
    } finally {
      setBusyId(null)
    }
  }

  const groups = CATEGORIES.map((cat) => {
    const items = active
      .filter((c) => c.category === cat)
      .map((c) => ({ c, status: statusFor(c, month, payments ?? []) }))
      .sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.c.due_day - b.c.due_day,
      )
    const total = items.reduce((s, x) => s + x.c.amount, 0)
    const unpaid = items.some(
      (x) => x.status === 'overdue' || x.status === 'upcoming' || x.status === 'unpaid',
    )
    return { cat, items, total, unpaid }
  })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => (b.unpaid ? 1 : 0) - (a.unpaid ? 1 : 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Commitments</h1>
        <Button asChild size="icon-sm" aria-label="Add commitment">
          <Link to="/commitments/new">
            <Plus />
          </Link>
        </Button>
      </div>

      {commitments === undefined ? (
        <>
          <MonthSwitcher />
          <CommitmentsSummary />
          <ListSkeleton />
        </>
      ) : all.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <MonthSwitcher />
          <CommitmentsSummary />

          {!isFuture && overdueCount > 0 && (
            <p className="text-sm font-medium text-overdue">
              {overdueCount} overdue
            </p>
          )}

          <div className="space-y-6">
            {groups.map((g) => (
              <Group key={g.cat} title={g.cat} total={g.total}>
                {g.items.map(({ c, status }, i) => (
                  <CommitmentRow
                    key={c.id}
                    commitment={c}
                    status={status}
                    busy={busyId === c.id}
                    onToggle={() => toggle(c.id, status === 'paid')}
                    border={i > 0}
                  />
                ))}
              </Group>
            ))}

            {paused.length > 0 && (
              <Group title="Paused">
                {paused.map((c, i) => (
                  <CommitmentRow
                    key={c.id}
                    commitment={c}
                    status="paused"
                    busy={false}
                    onToggle={() => {}}
                    border={i > 0}
                  />
                ))}
              </Group>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {isFuture
              ? `Preview of ${monthLabel(month)}.`
              : `Showing ${monthLabel(month)}.`}
          </p>
        </>
      )}
    </div>
  )
}

function Group({
  title,
  total,
  children,
}: {
  title: Category | 'Paused'
  total?: number
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {total != null && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {formatMoney(total)}/mth
          </span>
        )}
      </div>
      <ul className="overflow-hidden rounded-xl border bg-card">{children}</ul>
    </section>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {[3, 2].map((rows, g) => (
        <section key={g} className="space-y-2">
          <div className="flex justify-between px-1">
            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
          <ul className="overflow-hidden rounded-xl border bg-card">
            {Array.from({ length: rows }).map((_, i) => (
              <li
                key={i}
                className={cn('flex h-12 items-center gap-3 px-4', i > 0 && 'border-t')}
              >
                <div className="h-3.5 w-28 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
                <div className="size-5 shrink-0 animate-pulse rounded-full bg-muted" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">No commitments yet</h2>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          Rent, loans, subscriptions — add them once, check them off as you pay.
        </p>
      </div>
      <Button asChild>
        <Link to="/commitments/new">Add your first commitment</Link>
      </Button>
    </div>
  )
}
