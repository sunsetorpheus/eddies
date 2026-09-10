import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCommitments } from '@/features/commitments/commitments-store'
import { monthLabel } from '@/features/commitments/month'
import { contributionHistory, goalProgress } from './goal'
import type { SavingsGoal } from './types'

export function GoalForm() {
  const { id } = useParams()
  const { goals } = useCommitments()

  if (id) {
    if (goals === undefined) {
      return <p className="text-sm text-muted-foreground">Loading…</p>
    }
    const editing = goals.find((g) => g.id === id)
    if (!editing) {
      return <p className="text-sm text-muted-foreground">That goal no longer exists.</p>
    }
    return <Form editing={editing} />
  }
  return <Form />
}

function Form({ editing }: { editing?: SavingsGoal }) {
  const navigate = useNavigate()
  const { createGoal, updateGoal, removeGoal, setGoalAchieved, contributions } = useCommitments()

  const [name, setName] = useState(editing?.name ?? '')
  const [target, setTarget] = useState(editing ? String(editing.target) : '')
  const [targetDate, setTargetDate] = useState(editing?.target_date ?? '')
  const [busy, setBusy] = useState(false)

  const progress = editing ? goalProgress(editing, contributions ?? []) : null
  const history = editing ? contributionHistory(editing, contributions ?? []) : null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Enter a name.')
      return
    }
    const value = Number(target)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a target greater than zero.')
      return
    }
    setBusy(true)
    try {
      const draft = { name: trimmed, target: value, target_date: targetDate || null }
      if (editing) await updateGoal(editing.id, draft)
      else await createGoal(draft)
      navigate('/savings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save.')
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!editing) return
    setBusy(true)
    try {
      await removeGoal(editing.id)
      navigate('/savings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete.')
      setBusy(false)
    }
  }

  async function toggleAchieved() {
    if (!editing) return
    setBusy(true)
    try {
      await setGoalAchieved(editing.id, editing.achieved_at == null)
      navigate('/savings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {editing ? 'Edit goal' : 'New savings goal'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing ? 'Update the target or remove it.' : 'Something you want to save up for.'}
        </p>
      </div>

      {editing && history && history.months > 0 && (
        <p className="text-sm text-muted-foreground tabular-nums">
          {formatMoney(progress!.saved)} saved over {history.months}{' '}
          {history.months === 1 ? 'month' : 'months'}
          {history.lastMonth && ` · last added ${monthLabel(history.lastMonth)}`}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            maxLength={60}
            placeholder="Emergency fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="target">Target amount</Label>
          <Input
            id="target"
            type="number"
            inputMode="decimal"
            required
            min="0.01"
            step="0.01"
            placeholder="15000.00"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="target-date">Target date (optional)</Label>
          <Input
            id="target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          {editing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={busy}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {editing.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the goal and its logged contributions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {editing && (
          <Button
            type="button"
            variant="secondary"
            onClick={toggleAchieved}
            disabled={busy}
            className="w-full"
          >
            {editing.achieved_at ? 'Reopen goal' : 'Mark as achieved'}
          </Button>
        )}
      </form>
    </div>
  )
}
