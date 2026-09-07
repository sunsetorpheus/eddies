import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/supabase'
import { Button } from '@/components/ui/button'

export function Dashboard({ email }: { email: string }) {
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setBusy(false)
      toast.error(error.message)
    }
    // on success, the session clears and the router redirects to /sign-in
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-heading font-medium">Eddies</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{email}</span>
          <Button variant="outline" size="sm" onClick={signOut} disabled={busy}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      </main>
    </div>
  )
}
