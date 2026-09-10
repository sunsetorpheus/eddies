import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatMoney } from '@/lib/utils'
import { Bar } from '@/components/ui/bar'
import { useCommitments } from './commitments-store'
import { createdMonth, thisMonth, unpaidTotal } from './month'

/**
 * The month's summary: one hero number, a progress bar, and a quiet supporting line.
 * `linkTo` makes the whole card a link (used on the Dashboard to drill into Commitments).
 */
export function CommitmentsSummary({ linkTo }: { linkTo?: string }) {
  const { commitments, payments, profile, month } = useCommitments()

  if (commitments === undefined || payments === undefined) return <SummarySkeleton />

  const isFuture = month > thisMonth()
  const active = commitments.filter((c) => c.active && createdMonth(c) <= month)
  const monthlyTotal = active.reduce((sum, c) => sum + c.amount, 0)
  if (monthlyTotal === 0) return null

  const stillToPay = unpaidTotal(commitments, month, payments)
  const paid = monthlyTotal - stillToPay
  const pctPaid = Math.round((paid / monthlyTotal) * 100)

  const income = profile?.monthly_income ?? null
  const leftAfter = income != null ? income - monthlyTotal : null
  const pctOfIncome = income && income > 0 ? Math.round((monthlyTotal / income) * 100) : null

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {isFuture
            ? 'Due next month'
            : stillToPay > 0
              ? 'Still to pay this month'
              : 'All paid this month'}
        </p>
        {linkTo && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      </div>
      <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
        {formatMoney(isFuture ? monthlyTotal : stillToPay)}
      </p>

      {!isFuture && (
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pctPaid}% paid</span>
            <span className="tabular-nums">
              {formatMoney(paid)} of {formatMoney(monthlyTotal)}
            </span>
          </div>
          <Bar pct={pctPaid} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
        <span>{formatMoney(monthlyTotal)}/mth</span>
        <span aria-hidden>·</span>
        <span>{formatMoney(monthlyTotal * 12)}/yr</span>
        {leftAfter != null && (
          <>
            <span aria-hidden>·</span>
            <span className={cn(leftAfter < 0 && 'text-overdue')}>
              {formatMoney(leftAfter)} left of income
            </span>
          </>
        )}
        {pctOfIncome != null && (
          <>
            <span aria-hidden>·</span>
            <span className={cn(pctOfIncome > 50 && 'text-overdue')}>{pctOfIncome}% of income</span>
          </>
        )}
      </div>
    </>
  )

  const base = 'block rounded-xl border bg-card p-4'
  return linkTo ? (
    <Link to={linkTo} className={cn(base, 'transition-colors hover:bg-accent/40')}>
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  )
}

/** Same shape as the real card, so nothing jumps when the data lands. */
function SummarySkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-9 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-4 h-3 w-48 animate-pulse rounded bg-muted" />
    </div>
  )
}
