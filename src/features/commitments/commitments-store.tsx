import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { withTransition } from '@/lib/utils'
import { thisMonth, type MonthKey } from './month'
import type { Commitment, CommitmentDraft, Payment } from './types'

export type Profile = { username: string; monthly_income: number | null }

type Store = {
  commitments: Commitment[] | undefined
  payments: Payment[] | undefined
  profile: Profile | null | undefined
  month: MonthKey
  setMonth: (m: MonthKey) => void
  reload: () => Promise<void>
  create: (draft: CommitmentDraft) => Promise<void>
  update: (id: string, draft: Partial<CommitmentDraft>) => Promise<void>
  remove: (id: string) => Promise<void>
  markPaid: (commitmentId: string, month: string) => Promise<void>
  unmarkPaid: (commitmentId: string, month: string) => Promise<void>
  setIncome: (income: number | null) => Promise<void>
  setUsername: (username: string) => Promise<void>
}

const Ctx = createContext<Store | null>(null)

/** Wrap the authed app once so every screen shares one fetch of commitments, payments, and profile. */
export function CommitmentsProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [commitments, setCommitments] = useState<Commitment[] | undefined>(undefined)
  const [payments, setPayments] = useState<Payment[] | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [month, setMonth] = useState<MonthKey>(thisMonth())

  const reload = useCallback(async () => {
    const [c, p, pr] = await Promise.all([
      supabase.from('commitments').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*'),
      supabase.from('profiles').select('username, monthly_income').eq('id', userId).maybeSingle(),
    ])
    if (c.error) throw c.error
    if (p.error) throw p.error
    setCommitments(c.data)
    setPayments(p.data)
    setProfile(pr.data ?? null)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  const store: Store = {
    commitments,
    payments,
    profile,
    month,
    setMonth,
    reload,
    async create(draft) {
      const { error } = await supabase.from('commitments').insert(draft)
      if (error) throw error
      await reload()
    },
    async update(id, draft) {
      const { error } = await supabase.from('commitments').update(draft).eq('id', id)
      if (error) throw error
      await reload()
    },
    async remove(id) {
      const { error } = await supabase.from('commitments').delete().eq('id', id)
      if (error) throw error
      await reload()
    },
    async markPaid(commitmentId, m) {
      const optimistic: Payment = {
        id: `tmp-${commitmentId}-${m}`,
        user_id: '',
        commitment_id: commitmentId,
        month: m,
        paid_at: new Date().toISOString(),
      }
      withTransition(() => flushSync(() => setPayments((p) => [...(p ?? []), optimistic])))
      const { error } = await supabase
        .from('payments')
        .insert({ commitment_id: commitmentId, month: m })
      if (error) {
        setPayments((p) => (p ?? []).filter((x) => x.id !== optimistic.id))
        throw error
      }
      await reload()
    },
    async unmarkPaid(commitmentId, m) {
      let removed: Payment[] = []
      withTransition(() =>
        flushSync(() =>
          setPayments((p) => {
            removed = (p ?? []).filter((x) => x.commitment_id === commitmentId && x.month === m)
            return (p ?? []).filter(
              (x) => !(x.commitment_id === commitmentId && x.month === m),
            )
          }),
        ),
      )
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('commitment_id', commitmentId)
        .eq('month', m)
      if (error) {
        setPayments((p) => [...(p ?? []), ...removed])
        throw error
      }
      await reload()
    },
    async setIncome(income) {
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_income: income })
        .eq('id', userId)
      if (error) throw error
      await reload()
    },
    async setUsername(username) {
      const { error } = await supabase.from('profiles').update({ username }).eq('id', userId)
      if (error) throw error
      await reload()
    },
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useCommitments() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useCommitments must be used within CommitmentsProvider')
  return store
}
