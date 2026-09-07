import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './useSession'
import { AuthForm } from './pages/AuthForm'
import { Dashboard } from './pages/Dashboard'

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
            <Route path="/" element={<Dashboard email={session.user.email ?? ''} />} />
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
