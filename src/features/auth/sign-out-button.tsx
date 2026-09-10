import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function SignOutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setBusy(false)
      toast.error(error.message)
    }
    // on success the session clears and the router redirects to /sign-in
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={signOut}
      disabled={busy}
      aria-label="Sign out"
      className={cn('text-overdue hover:text-overdue', className)}
    >
      <LogOut />
    </Button>
  )
}
