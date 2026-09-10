import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useProfile } from '@/features/auth/use-profile'
import { SignOutButton } from '@/features/auth/sign-out-button'
import { NAV_ITEMS } from './nav'

/** Nav links, styled for either the desktop sidebar or the phone bottom bar. */
function NavItems({ variant }: { variant: 'sidebar' | 'bar' }) {
  const sidebar = variant === 'sidebar'
  return NAV_ITEMS.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          sidebar
            ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted aria-[current=page]:bg-muted'
            : 'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs',
          isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      <Icon className={sidebar ? 'size-4' : 'size-5'} aria-hidden />
      {label}
    </NavLink>
  ))
}

export function AppShell({ userId, email }: { userId: string; email: string }) {
  const username = useProfile(userId)
  const who = username ?? email

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-52 shrink-0 flex-col border-r md:flex">
        <span className="font-heading px-4 py-4 text-lg font-medium">Eddies</span>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-2">
          <NavItems variant="sidebar" />
        </nav>
        <div className="flex flex-col gap-2 border-t p-4">
          <span className="truncate text-sm text-muted-foreground">{who}</span>
          <SignOutButton />
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
        <span className="font-heading font-medium">Eddies</span>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm text-muted-foreground">{who}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Page content */}
      <main id="main" className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl p-4 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Phone bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavItems variant="bar" />
      </nav>
    </div>
  )
}
