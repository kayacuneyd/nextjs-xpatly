'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserManagementActionsProps {
  userId: string
  currentRole: string
  isVerified: boolean
  isBanned: boolean
}

export function UserManagementActions({
  userId,
  currentRole,
  isVerified,
  isBanned,
}: UserManagementActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  const handleToggleVerified = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !isVerified }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling verification:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBan = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_banned: !isBanned }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error toggling ban:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (newRole: string) => {
    setLoading(true)
    setShowRoleMenu(false)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error changing role:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Verify/Unverify Button */}
      <button
        onClick={handleToggleVerified}
        disabled={loading}
        className={`px-2 py-1 text-xs rounded transition ${
          isVerified
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
        title={isVerified ? 'Unverify user' : 'Verify user'}
      >
        {isVerified ? '✓' : 'Verify'}
      </button>

      {/* Ban/Unban Button */}
      <button
        onClick={handleToggleBan}
        disabled={loading}
        className={`px-2 py-1 text-xs rounded transition ${
          isBanned
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } disabled:opacity-50`}
        title={isBanned ? 'Unban user' : 'Ban user'}
      >
        {isBanned ? 'Unban' : 'Ban'}
      </button>

      {/* Role Change Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          disabled={loading}
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition disabled:opacity-50"
          title="Change role"
        >
          Role ▼
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              <button
                onClick={() => handleChangeRole('user')}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
              >
                User
              </button>
              <button
                onClick={() => handleChangeRole('owner')}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
              >
                Owner
              </button>
              <button
                onClick={() => handleChangeRole('moderator')}
                className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
              >
                Moderator
              </button>
              {currentRole !== 'super_admin' && (
                <button
                  onClick={() => handleChangeRole('super_admin')}
                  className="block w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50"
                >
                  Super Admin
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showRoleMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowRoleMenu(false)}
        />
      )}
    </div>
  )
}
