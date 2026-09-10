import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useCommitments } from './commitments-store'
import { monthLabel, paymentHistory } from './month'
import { CATEGORIES, type Category, type Commitment } from './types'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function CommitmentForm() {
  const { id } = useParams()
  const { commitments } = useCommitments()

  if (id) {
    if (commitments === undefined) {
      return <p className="text-sm text-muted-foreground">Loading…</p>
    }
    const editing = commitments.find((c) => c.id === id)
    if (!editing) {
      return <p className="text-sm text-muted-foreground">That commitment no longer exists.</p>
    }
    return <Form editing={editing} />
  }
  return <Form />
}

function Form({ editing }: { editing?: Commitment }) {
  const navigate = useNavigate()
  const { create, update, remove, payments } = useCommitments()

  const [name, setName] = useState(editing?.name ?? '')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [dueDay, setDueDay] = useState(editing?.due_day ?? 1)
  const [category, setCategory] = useState<Category>(editing?.category ?? 'Other')
  const [active, setActive] = useState(editing?.active ?? true)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Enter a name.')
      return
    }
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter an amount greater than zero.')
      return
    }
    setBusy(true)
    try {
      const draft = { name: trimmed, amount: value, due_day: dueDay, category, active }
      if (editing) await update(editing.id, draft)
      else await create(draft)
      navigate('/commitments')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save.')
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!editing) return
    setBusy(true)
    try {
      await remove(editing.id)
      navigate('/commitments')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {editing ? 'Edit commitment' : 'New commitment'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing ? 'Update the details or remove it.' : 'Add something you pay every month.'}
        </p>
      </div>

      {editing &&
        (() => {
          const h = paymentHistory(editing, payments ?? [])
          if (h.of === 0) return null
          return (
            <p className="text-sm text-muted-foreground">
              Paid {h.paid} of the last {h.of} {h.of === 1 ? 'month' : 'months'}
              {h.lastPaid && ` · last paid ${monthLabel(h.lastPaid)}`}
            </p>
          )
        })()}

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            maxLength={60}
            placeholder="Rent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            required
            min="0.01"
            step="0.01"
            placeholder="1200.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {Number(amount) > 0 && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatMoney(Number(amount) * 12)} per year
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="due-day">Due day of month</Label>
          <Select value={String(dueDay)} onValueChange={(v) => setDueDay(Number(v))}>
            <SelectTrigger id="due-day" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dueDay > 28 && (
            <p className="text-xs text-muted-foreground">
              In shorter months this falls on the last day.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <Label htmlFor="active" className="grid gap-1">
            <span className="text-sm font-medium">Active</span>
            <span className="text-xs font-normal text-muted-foreground">
              Counts toward your monthly total
            </span>
          </Label>
          <Switch id="active" checked={active} onCheckedChange={setActive} />
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
                    This removes it from your list. You can add it again later.
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
      </form>
    </div>
  )
}
