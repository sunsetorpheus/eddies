export type SavingsGoal = {
  id: string
  user_id: string
  name: string
  target: number
  target_date: string | null // YYYY-MM-DD, optional
  planned_monthly: number | null // optional fixed monthly contribution, for projecting finish
  achieved_at: string | null
  created_at: string
}

/** Fields the user edits. */
export type GoalDraft = Pick<SavingsGoal, 'name' | 'target' | 'target_date' | 'planned_monthly'>

/** One month's contribution to a goal. `month` is the 1st, e.g. 2026-09-01. */
export type Contribution = {
  id: string
  user_id: string
  goal_id: string
  month: string
  amount: number
  added_at: string
}
