import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './features/auth/use-session'
import { AuthForm } from './features/auth/auth-form'
import { AppShell } from './features/app-shell/app-shell'
import { Dashboard } from './features/dashboard/dashboard'
import { Commitments } from './features/commitments/commitments'
import { Settings } from './features/settings/settings'

export default function App() {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {session ? (
          <>
            <Route
              element={<AppShell userId={session.user.id} email={session.user.email ?? ''} />}
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/commitments" element={<Commitments />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/sign-in" element={<AuthForm mode="sign-in" />} />
            <Route path="/sign-up" element={<AuthForm mode="sign-up" />} />
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}
