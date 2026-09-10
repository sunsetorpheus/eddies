import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const USERNAME_PATTERN = '^[a-zA-Z0-9_]{3,20}$'

/** Turn "email or username" into an email: pass emails through, look usernames up. */
async function resolveEmail(identifier: string): Promise<string | null> {
  if (identifier.includes('@')) return identifier
  const { data, error } = await supabase.rpc('email_for_username', {
    lookup_username: identifier,
  })
  if (error) throw error
  return data
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [identifier, setIdentifier] = useState('') // email on sign-up, email-or-username on sign-in
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: { data: { username } },
        })
        if (error) throw error
        toast.success('Account created. Check your email to confirm, then sign in.')
        return
      }

      const email = await resolveEmail(identifier.trim())
      if (!email) {
        toast.error('No account with that username.')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // on success the session updates and the router redirects to the dashboard
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      toast.error(
        message.includes('duplicate key') || message.includes('profiles_username')
          ? 'That username is taken.'
          : message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {isSignUp ? 'Create your account' : 'Sign in to Eddies'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Pick a username, then enter an email and password.'
              : 'Enter your email or username and password to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  pattern={USERNAME_PATTERN}
                  title="3–20 characters: letters, numbers, or underscores"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="identifier">{isSignUp ? 'Email' : 'Email or username'}</Label>
              <Input
                id="identifier"
                type={isSignUp ? 'email' : 'text'}
                autoComplete={isSignUp ? 'email' : 'username'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy
                ? isSignUp
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignUp
                  ? 'Create account'
                  : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Link to="/sign-in" className="text-foreground underline underline-offset-4">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link to="/sign-up" className="text-foreground underline underline-offset-4">
                  Sign up
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
