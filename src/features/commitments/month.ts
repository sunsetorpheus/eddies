import { ordinal } from '@/lib/utils'
import type { Commitment, Payment } from './types'

/** A month key: the 1st of that month as YYYY-MM-DD, e.g. "2026-09-01". */
export type MonthKey = string

export function monthKey(date: Date): MonthKey {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export function thisMonth(): MonthKey {
  return monthKey(new Date())
}

/** Shift a month key by n months (n can be negative). */
export function addMonths(key: MonthKey, n: number): MonthKey {
  const [y, m] = key.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + n, 1))
}

/** "September 2026" */
export function monthLabel(key: MonthKey): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
}

/** The month a commitment was created, as a month key. */
export function createdMonth(commitment: Commitment): MonthKey {
  return monthKey(new Date(commitment.created_at))
}

/**
 * Status of a commitment for a given month.
 * - none: the month is in the future, or before the commitment existed — no action, no label
 * - paid: a payment row exists for that month
 * - overdue: current month, unpaid, past its due day
 * - upcoming: current month, unpaid, still has time
 * - unpaid: a past month with no payment (history — not "overdue", just wasn't logged)
 */
export type Status = 'none' | 'paid' | 'overdue' | 'upcoming' | 'unpaid'

export function statusFor(
  commitment: Commitment,
  month: MonthKey,
  payments: Payment[],
  now = new Date(),
): Status {
  if (month > thisMonth() || month < createdMonth(commitment)) return 'none'

  const paid = payments.some((p) => p.commitment_id === commitment.id && p.month === month)
  if (paid) return 'paid'

  if (month < thisMonth()) return 'unpaid' // a past month, never logged
  return now.getDate() >= commitment.due_day ? 'overdue' : 'upcoming'
}

/**
 * A short label for a row's due state this month + a colour hint.
 * `soon` = unpaid and within 5 days of the due day.
 */
export function dueLabel(
  commitment: Commitment,
  status: Status,
  now = new Date(),
): { text: string; tone: 'muted' | 'soon' | 'overdue' } {
  if (status === 'overdue') return { text: 'overdue', tone: 'overdue' }
  if (status === 'upcoming') {
    const days = commitment.due_day - now.getDate()
    if (days <= 5) return { text: `in ${days}d`, tone: 'soon' }
  }
  return { text: ordinal(commitment.due_day), tone: 'muted' }
}

/** Commitments active and already created in `month` that still have no payment. */
export function unpaidTotal(
  commitments: Commitment[],
  month: MonthKey,
  payments: Payment[],
): number {
  return commitments
    .filter((c) => c.active && createdMonth(c) <= month)
    .filter((c) => !payments.some((p) => p.commitment_id === c.id && p.month === month))
    .reduce((sum, c) => sum + c.amount, 0)
}

/**
 * Payment history for one commitment: how many months it's been paid, out of how
 * many full months since it was created (never more than 12), and the last month paid.
 */
export function paymentHistory(
  commitment: Commitment,
  payments: Payment[],
): { paid: number; of: number; lastPaid: MonthKey | null } {
  const start = createdMonth(commitment)
  // completed months between start and last month, capped at 12
  const months: MonthKey[] = []
  for (let i = 1; i <= 12; i++) {
    const m = addMonths(thisMonth(), -i)
    if (m < start) break
    months.push(m)
  }

  const paidMonths = new Set(
    payments.filter((p) => p.commitment_id === commitment.id).map((p) => p.month),
  )
  const paid = months.filter((m) => paidMonths.has(m)).length

  const allPaid = [...paidMonths].sort()
  const lastPaid = allPaid.length ? allPaid[allPaid.length - 1] : null

  return { paid, of: months.length, lastPaid }
}

/** Earliest month the user can navigate back to: their oldest payment, else this month. */
export function earliestMonth(payments: Payment[]): MonthKey {
  if (payments.length === 0) return thisMonth()
  return payments.reduce((min, p) => (p.month < min ? p.month : min), payments[0].month)
}
