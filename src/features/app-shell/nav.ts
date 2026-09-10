import { LayoutDashboard, List, PiggyBank, User, type LucideIcon } from 'lucide-react'

export type NavItem = { to: string; label: string; icon: LucideIcon }

/** The app's primary destinations. Feeds both the desktop sidebar and the phone bottom bar. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/commitments', label: 'Commitments', icon: List },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/profile', label: 'Profile', icon: User },
]
