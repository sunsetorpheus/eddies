import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn, formatMoney } from '@/lib/utils'
import { dueLabel, type Status } from './month'
import type { Commitment } from './types'

type RowStatus = Status | 'paused'

const TONE = {
  muted: 'text-muted-foreground',
  soon: 'text-due',
  overdue: 'text-overdue',
} as const

export function CommitmentRow({
  commitment: c,
  status,
  busy,
  onToggle,
  border,
}: {
  commitment: Commitment
  status: RowStatus
  busy: boolean
  onToggle: () => void
  border: boolean
}) {
  const navigate = useNavigate()
  const isPaid = status === 'paid'
  const isPaused = status === 'paused'
  const isOverdue = status === 'overdue'
  const canToggle = !isPaused && status !== 'none'

  const due =
    isPaused || status === 'none' || isPaid ? null : dueLabel(c, status as Status)

  return (
    <li
      style={{ viewTransitionName: `row-${c.id}` }}
      className={cn(
        'flex items-center transition-opacity duration-200',
        border && 'border-t',
        isPaused && 'opacity-45',
      )}
    >
      <button
        type="button"
        onClick={() => navigate(`/commitments/${c.id}`)}
        className="flex h-12 min-w-0 flex-1 items-center justify-between gap-4 rounded-md pl-4 text-left transition-colors hover:bg-accent/40"
      >
        <span className="min-w-0 truncate">
          <span className={cn('text-sm', isPaid && 'text-muted-foreground')}>{c.name}</span>
          {due && <span className={cn('ml-1.5 text-xs', TONE[due.tone])}>· {due.text}</span>}
        </span>
        <span
          className={cn(
            'shrink-0 text-sm tabular-nums',
            isPaid ? 'text-muted-foreground' : 'font-medium',
            isOverdue && 'text-overdue',
          )}
        >
          {formatMoney(c.amount)}
        </span>
      </button>

      {canToggle ? (
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={isPaid ? `Mark ${c.name} unpaid` : `Mark ${c.name} paid`}
          className="flex h-12 shrink-0 items-center pl-3 pr-4 disabled:opacity-50"
        >
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full border transition-colors',
              isPaid ? 'border-paid bg-paid text-background' : 'border-muted-foreground/40',
            )}
          >
            {isPaid && <Check className="size-3.5" aria-hidden />}
          </span>
        </button>
      ) : (
        <span className="w-4 shrink-0 pr-4" />
      )}
    </li>
  )
}
