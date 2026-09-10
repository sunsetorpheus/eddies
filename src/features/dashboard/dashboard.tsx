import { Link } from 'react-router-dom'
import { cn, formatMoney, ordinal } from '@/lib/utils'
import { useCommitments } from '@/features/commitments/commitments-store'
import { CommitmentsSummary } from '@/features/commitments/summary'
import { MonthSwitcher } from '@/features/commitments/month-switcher'
import { createdMonth, statusFor, thisMonth } from '@/features/commitments/month'

export function Dashboard() {
  const { commitments, payments, month } = useCommitments()
  const loading = commitments === undefined || payments === undefined

  const isFuture = month > thisMonth()
  const active = loading
    ? []
    : commitments.filter((c) => c.active && createdMonth(c) <= month)

  const overdue = active
    .filter((c) => statusFor(c, month, payments ?? []) === 'overdue')
    .sort((a, b) => a.due_day - b.due_day)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <MonthSwitcher />
      </div>

      {loading ? (
        <CommitmentsSummary />
      ) : active.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isFuture ? (
            'Nothing scheduled for next month yet.'
          ) : (
            <>
              No active commitments.{' '}
              <Link to="/commitments" className="underline underline-offset-4">
                Add some
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <>
          <CommitmentsSummary linkTo="/commitments" />

          {overdue.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-overdue">Overdue</h2>
              <ul className="rounded-lg border border-overdue/30 text-sm">
                {overdue.map((c, i) => (
                  <li
                    key={c.id}
                    className={cn('flex justify-between px-4 py-2.5', i > 0 && 'border-t')}
                  >
                    <span>
                      {c.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        was due {ordinal(c.due_day)}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums">{formatMoney(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
