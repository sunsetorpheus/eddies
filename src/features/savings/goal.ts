import { addMonths, monthLabel, thisMonth, type MonthKey } from '@/features/commitments/month'
import type { Contribution, SavingsGoal } from './types'

/** Everything the UI needs about one goal's progress. */
export type GoalProgress = {
  saved: number
  remaining: number
  pct: number // 0–100, clamped
  done: boolean // marked achieved, or saved >= target
  /** Month the goal is projected to finish, from planned_monthly. Null if not set, or done. */
  projectedFinish: MonthKey | null
  /** "September 2026", or null. */
  projectedFinishLabel: string | null
}

export function contributionsFor(goalId: string, all: Contribution[]): Contribution[] {
  return all.filter((c) => c.goal_id === goalId)
}

export function goalProgress(goal: SavingsGoal, contributions: Contribution[]): GoalProgress {
  const mine = contributionsFor(goal.id, contributions)
  const saved = mine.reduce((s, c) => s + c.amount, 0)
  const remaining = Math.max(0, goal.target - saved)
  const pct = goal.target > 0 ? Math.min(100, Math.round((saved / goal.target) * 100)) : 0
  const done = goal.achieved_at != null || saved >= goal.target

  let projectedFinish: MonthKey | null = null
  if (!done && goal.planned_monthly) {
    const monthsLeft = Math.ceil(remaining / goal.planned_monthly)
    projectedFinish = addMonths(thisMonth(), monthsLeft)
  }

  return {
    saved,
    remaining,
    pct,
    done,
    projectedFinish,
    projectedFinishLabel: projectedFinish ? monthLabel(projectedFinish) : null,
  }
}

/** Total saved across every goal. */
export function totalSaved(contributions: Contribution[]): number {
  return contributions.reduce((s, c) => s + c.amount, 0)
}

/** Total contributed across every goal in a given month. */
export function monthTotal(contributions: Contribution[], month: MonthKey): number {
  return contributions.filter((c) => c.month === month).reduce((s, c) => s + c.amount, 0)
}

/** Contribution history for one goal, mirroring commitments' paymentHistory. */
export function contributionHistory(
  goal: SavingsGoal,
  contributions: Contribution[],
): { months: number; total: number; lastMonth: MonthKey | null } {
  const mine = contributionsFor(goal.id, contributions)
  const total = mine.reduce((s, c) => s + c.amount, 0)
  const sorted = mine.map((c) => c.month).sort()
  return {
    months: mine.length,
    total,
    lastMonth: sorted.length ? sorted[sorted.length - 1] : null,
  }
}
