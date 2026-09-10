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
            ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors'
            : 'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
          isActive
            ? sidebar
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground'
            : 'text-muted-foreground hover:text-foreground',
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
      <aside className="hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-heading text-base font-semibold tracking-tight">Eddies</span>
        </div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 p-2">
          <NavItems variant="sidebar" />
        </nav>
        <div className="flex flex-col gap-2 border-t p-3">
          <span className="truncate px-1 text-sm text-muted-foreground">{who}</span>
          <SignOutButton />
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <span className="font-heading text-base font-semibold tracking-tight">Eddies</span>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm text-muted-foreground">{who}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Page content */}
      <main id="main" className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Phone bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      >
        <NavItems variant="bar" />
      </nav>
    </div>
  )
}
