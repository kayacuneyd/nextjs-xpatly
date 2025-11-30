'use client'

import { signOut } from '@/lib/auth/actions'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface UserNavProps {
  user: {
    email: string
  }
  role?: 'super_admin' | 'moderator' | 'owner' | 'user'
}

export function UserNav({ user, role = 'user' }: UserNavProps) {
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations()
  const locale = useLocale()
  
  const isAdmin = role === 'super_admin' || role === 'moderator'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className={`w-8 h-8 ${isAdmin ? 'bg-purple-600' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
          <span className="text-white font-medium text-sm">
            {user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block text-sm text-gray-700 max-w-[150px] truncate">
          {user.email}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            {isAdmin && (
              <p className="text-xs text-purple-600 font-medium mt-1">
                {role === 'super_admin' ? '👑 Super Admin' : '🛡️ Moderator'}
              </p>
            )}
          </div>
          
          {isAdmin ? (
            // Admin Menu
            <>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>🛠️</span>
                Admin Dashboard
              </Link>
              
              <Link
                href="/admin/listings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>📝</span>
                Manage Listings
              </Link>
              
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>👥</span>
                Manage Users
              </Link>
              
              <Link
                href="/admin/flagged"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>🚩</span>
                Flagged Content
              </Link>
            </>
          ) : (
            // Regular User Menu
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>📊</span>
                {t('nav.dashboard') || 'Dashboard'}
              </Link>
              
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>👤</span>
                {t('nav.profile')}
              </Link>
              
              <Link
                href={`/${locale}/create-listing`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(false)}
              >
                <span>➕</span>
                {t('nav.createListing')}
              </Link>
            </>
          )}
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            <span>🚪</span>
            {loading ? t('common.loading') : t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
