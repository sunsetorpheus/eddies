export const CATEGORIES = [
  'Utilities',
  'Transport',
  'Loan',
  'Subscriptions',
  'Family',
  'Savings',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export type Commitment = {
  id: string
  user_id: string
  name: string
  amount: number
  due_day: number // 1–31
  category: Category
  active: boolean
  created_at: string
}

/** Fields the user edits. */
export type CommitmentDraft = Pick<
  Commitment,
  'name' | 'amount' | 'due_day' | 'category' | 'active'
>

/** A commitment marked paid for a given month. `month` is the 1st, e.g. 2026-09-01. */
export type Payment = {
  id: string
  user_id: string
  commitment_id: string
  month: string
  paid_at: string
}
