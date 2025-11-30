'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UserNav } from '@/components/ui/user-nav'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type UserType = 'landlord' | 'tenant' | 'both'

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [profile, setProfile] = useState({
    email: '',
    user_type: 'tenant' as UserType,
    created_at: '',
    is_approved: false,
    is_verified: false,
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Redirect admins to admin dashboard
    if (profileData?.role === 'super_admin' || profileData?.role === 'moderator') {
      router.push('/admin')
      return
    }

    if (profileData) {
      setProfile({
        email: profileData.email,
        user_type: profileData.user_type,
        created_at: profileData.created_at,
        is_approved: profileData.is_approved,
        is_verified: profileData.is_verified,
      })
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('users')
        .update({ user_type: profile.user_type })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({ newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', text: 'Password updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Xpatly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}/listings`} className="text-gray-600 hover:text-gray-900 font-medium transition">
              Listings
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900 font-medium transition">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <UserNav user={{ email: profile.email }} />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Profile</h1>
            <p className="mt-2 text-gray-600">Update your account settings</p>
          </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, user_type: 'tenant' })}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      profile.user_type === 'tenant'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🏠</div>
                    <div className="text-sm font-medium">Tenant</div>
                    <div className="text-xs text-gray-500 mt-1">Looking to rent</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, user_type: 'landlord' })}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      profile.user_type === 'landlord'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🔑</div>
                    <div className="text-sm font-medium">Landlord</div>
                    <div className="text-xs text-gray-500 mt-1">I have property</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, user_type: 'both' })}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      profile.user_type === 'both'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🏡</div>
                    <div className="text-sm font-medium">Both</div>
                    <div className="text-xs text-gray-500 mt-1">Rent & list</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Approval Status</div>
                  {profile.is_approved ? (
                    <span className="text-green-600 font-medium">✓ Approved</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">⏳ Pending</span>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Verification</div>
                  {profile.is_verified ? (
                    <span className="text-blue-600 font-medium">✓ Verified</span>
                  ) : (
                    <span className="text-gray-600 font-medium">Not verified</span>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Member Since</div>
                  <span className="text-gray-900 font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                onClick={() => alert('Account deletion is not yet implemented')}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">X</span>
                </div>
                <span className="text-2xl font-bold text-white">Xpatly</span>
              </div>
              <p className="text-sm">
                Fighting housing discrimination in Estonia. Housing for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/listings`} className="hover:text-white transition">Browse Listings</Link></li>
                <li><Link href={`/${locale}/create-listing`} className="hover:text-white transition">Create Listing</Link></li>
                <li><Link href={`/${locale}/about`} className="hover:text-white transition">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/terms`} className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href={`/${locale}/privacy`} className="hover:text-white transition">Privacy Policy</Link></li>
                <li><a href="mailto:support@xpatly.com" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Languages</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/en/dashboard/profile" className="hover:text-white transition">🇬🇧 English</Link></li>
                <li><Link href="/et/dashboard/profile" className="hover:text-white transition">🇪🇪 Eesti</Link></li>
                <li><Link href="/ru/dashboard/profile" className="hover:text-white transition">🇷🇺 Русский</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Xpatly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
