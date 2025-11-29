'use client'

import { signOut } from '@/lib/auth/actions'
import { Button } from './button'
import { useState } from 'react'
import Link from 'next/link'

interface UserNavProps {
  user: {
    email: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-600">{user.email}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={loading}
      >
        {loading ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  )
}
