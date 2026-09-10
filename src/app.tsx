import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './features/auth/use-session'
import { AuthForm } from './features/auth/auth-form'
import { AppShell } from './features/app-shell/app-shell'
import { Dashboard } from './features/dashboard/dashboard'
import { CommitmentsProvider } from './features/commitments/commitments-store'
import { Commitments } from './features/commitments/commitments'
import { CommitmentForm } from './features/commitments/commitment-form'
import { Profile } from './features/profile/profile'

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
              element={
                <CommitmentsProvider userId={session.user.id}>
                  <AppShell email={session.user.email ?? ''} />
                </CommitmentsProvider>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/commitments" element={<Commitments />} />
              <Route path="/commitments/new" element={<CommitmentForm />} />
              <Route path="/commitments/:id" element={<CommitmentForm />} />
              <Route path="/profile" element={<Profile />} />
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
