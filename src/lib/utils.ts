import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ponytail: currency hardcoded to MYR; move to a user setting when multi-currency matters
const money = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' })
const moneyWhole = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  maximumFractionDigits: 0,
})

/** "RM 1,200.50", or "RM 1,200" when the amount is whole. */
export function formatMoney(amount: number) {
  return (Number.isInteger(amount) ? moneyWhole : money).format(amount)
}

/** "1st", "2nd", "3rd", "21st"… for a day of the month. */
export function ordinal(day: number) {
  const rem100 = day % 100
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`
}

/** Run a DOM update inside a View Transition when the browser supports it. */
export function withTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    document.startViewTransition(update)
  } else {
    update()
  }
}
