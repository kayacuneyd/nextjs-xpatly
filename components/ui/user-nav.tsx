'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut } from '@/lib/auth/actions'
import { Button } from './button'

interface UserNavProps {
  user: {
    email: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations()

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
        {loading ? t('common.loading') : t('nav.logout')}
      </Button>
    </div>
  )
}
