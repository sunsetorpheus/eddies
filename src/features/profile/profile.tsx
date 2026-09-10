import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCommitments, type Profile as ProfileData } from '@/features/commitments/commitments-store'

const USERNAME_PATTERN = '^[a-zA-Z0-9_]{3,20}$'

export function Profile() {
  const { profile, setIncome, setUsername } = useCommitments()

  if (profile === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return <View profile={profile} setIncome={setIncome} setUsername={setUsername} />
}

function View({
  profile,
  setIncome,
  setUsername,
}: {
  profile: ProfileData | null
  setIncome: (income: number | null) => Promise<void>
  setUsername: (username: string) => Promise<void>
}) {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <UsernameSection current={profile?.username ?? ''} save={setUsername} />
      <IncomeSection current={profile?.monthly_income ?? null} save={setIncome} />
      <PasswordSection />
    </div>
  )
}

/** A titled card with the form body in the padded area and the action in a divided footer. */
function Section({
  title,
  action,
  children,
}: {
  title: string
  action: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="space-y-3 p-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
      <div className="flex justify-end border-t bg-muted/30 px-4 py-3">{action}</div>
    </section>
  )
}

function UsernameSection({
  current,
  save,
}: {
  current: string
  save: (username: string) => Promise<void>
}) {
  const [value, setValue] = useState(current)
  const [busy, setBusy] = useState(false)
  const changed = value.trim() !== current

  async function submit() {
    setBusy(true)
    try {
      await save(value.trim())
      toast.success('Username updated.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(
        msg.includes('duplicate') || msg.includes('profiles_username')
          ? 'That username is taken.'
          : 'Could not update username.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section
      title="Username"
      action={
        <Button size="sm" onClick={submit} disabled={busy || !changed || !value.trim()}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <Label htmlFor="username" className="sr-only">
        Username
      </Label>
      <Input
        id="username"
        pattern={USERNAME_PATTERN}
        title="3–20 characters: letters, numbers, or underscores"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Section>
  )
}

function IncomeSection({
  current,
  save,
}: {
  current: number | null
  save: (income: number | null) => Promise<void>
}) {
  const initial = current != null ? String(current) : ''
  const [value, setValue] = useState(initial)
  const [busy, setBusy] = useState(false)
  const changed = value.trim() !== initial

  async function submit() {
    const num = value.trim() === '' ? null : Number(value)
    if (num != null && (!Number.isFinite(num) || num < 0)) {
      toast.error('Enter a valid amount.')
      return
    }
    setBusy(true)
    try {
      await save(num)
      toast.success('Saved.')
    } catch {
      toast.error('Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section
      title="Monthly income"
      action={
        <Button size="sm" onClick={submit} disabled={busy || !changed}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <Label htmlFor="income" className="sr-only">
        Monthly income
      </Label>
      <Input
        id="income"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="5000.00"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Shows what's left after your commitments on the Commitments page.
      </p>
    </Section>
  )
}

function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (next.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    if (next !== confirm) {
      toast.error('New passwords do not match.')
      return
    }
    if (next === current) {
      toast.error('New password must be different.')
      return
    }

    setBusy(true)
    try {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email
      if (!email) throw new Error('no email')

      // verify the current password by attempting a sign-in with it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      })
      if (verifyError) {
        toast.error('Current password is wrong.')
        return
      }

      const { error } = await supabase.auth.updateUser({ password: next })
      if (error) throw error

      setCurrent('')
      setNext('')
      setConfirm('')
      toast.success('Password changed.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section
      title="Password"
      action={
        <Button size="sm" onClick={submit} disabled={busy || !current || !next || !confirm}>
          {busy ? 'Changing…' : 'Change password'}
        </Button>
      }
    >
      <div className="grid gap-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
    </Section>
  )
}
