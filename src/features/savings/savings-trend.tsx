import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '@/lib/utils'
import { addMonths, monthLabel, thisMonth, type MonthKey } from '@/features/commitments/month'
import { contributionsFor } from './goal'
import type { Contribution } from './types'

const MONTHS_SHOWN = 6

/** Cumulative saved-so-far per month, for the last `MONTHS_SHOWN` months. */
function trendData(contributions: Contribution[], goalId?: string) {
  const mine = goalId ? contributionsFor(goalId, contributions) : contributions
  const byMonth = new Map<MonthKey, number>()
  for (const c of mine) byMonth.set(c.month, (byMonth.get(c.month) ?? 0) + c.amount)

  const months: MonthKey[] = []
  for (let i = MONTHS_SHOWN - 1; i >= 0; i--) months.push(addMonths(thisMonth(), -i))

  let cumulative = mine
    .filter((c) => c.month < months[0])
    .reduce((s, c) => s + c.amount, 0)

  return months.map((m) => {
    cumulative += byMonth.get(m) ?? 0
    return { month: m, label: monthLabel(m).split(' ')[0], total: cumulative }
  })
}

/**
 * Cumulative savings over the last 6 months, as a filled line chart.
 * `goalId` scopes to one goal; omitted shows the total across every goal.
 */
export function SavingsTrend({
  contributions,
  goalId,
}: {
  contributions: Contribution[]
  goalId?: string
}) {
  const data = trendData(contributions, goalId)
  if (data.every((d) => d.total === 0)) return null

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="savings-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--paid)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--paid)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <YAxis hide domain={[0, (max: number) => max * 1.1]} />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0].payload as { label: string; total: number }
              return (
                <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm">
                  <p className="text-muted-foreground">{point.label}</p>
                  <p className="font-medium tabular-nums text-popover-foreground">
                    {formatMoney(point.total)}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--paid)"
            strokeWidth={2}
            fill="url(#savings-trend-fill)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--paid)', stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
