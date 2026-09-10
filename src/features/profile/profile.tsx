import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCommitments, type Profile as ProfileData } from '@/features/commitments/commitments-store'

export function Profile() {
  const { profile, setIncome } = useCommitments()

  if (profile === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return <View profile={profile} setIncome={setIncome} />
}

function View({
  profile,
  setIncome,
}: {
  profile: ProfileData | null
  setIncome: (income: number | null) => Promise<void>
}) {
  const [value, setValue] = useState(
    profile?.monthly_income != null ? String(profile.monthly_income) : '',
  )
  const [busy, setBusy] = useState(false)

  async function save() {
    const num = value.trim() === '' ? null : Number(value)
    if (num != null && (!Number.isFinite(num) || num < 0)) {
      toast.error('Enter a valid amount.')
      return
    }
    setBusy(true)
    try {
      await setIncome(num)
      toast.success('Saved.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Signed in as {profile?.username ?? '—'}.</p>
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="income">Monthly income</Label>
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
        </div>
        <p className="text-xs text-muted-foreground">
          Used on the Commitments page to show what's left after your fixed costs.
        </p>
        <div className="flex justify-end">
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
