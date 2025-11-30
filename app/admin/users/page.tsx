import { createClient } from '@/lib/supabase/server'
import { UserManagementActions } from '@/components/admin/UserManagementActions'

// Disable caching to always show latest users
export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdminUser = {
  id: string
  email: string | null
  role: string
  is_verified: boolean
  is_banned: boolean
  created_at: string
  listings?: { count: number }[]
}

async function getUsers(): Promise<AdminUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      listings:listings(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data || []
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'moderator'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'owner'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {user.is_verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          🚫 Banned
                        </span>
                      )}
                      {!user.is_verified && !user.is_banned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.listings?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <UserManagementActions
                      userId={user.id}
                      currentRole={user.role}
                      isVerified={user.is_verified}
                      isBanned={user.is_banned}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 break-all">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {user.id.substring(0, 8)}...
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                user.role === 'super_admin'
                  ? 'bg-purple-100 text-purple-800'
                  : user.role === 'moderator'
                  ? 'bg-blue-100 text-blue-800'
                  : user.role === 'owner'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role.replace('_', ' ')}
              </span>
              {user.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              )}
              {user.is_banned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  🚫 Banned
                </span>
              )}
              {!user.is_verified && !user.is_banned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Unverified
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>📋 {user.listings?.[0]?.count || 0} listings</span>
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="border-t pt-3">
              <UserManagementActions
                userId={user.id}
                currentRole={user.role}
                isVerified={user.is_verified}
                isBanned={user.is_banned}
              />
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">👥</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No users yet
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Users will appear here once they register.
          </p>
        </div>
      )}
    </div>
  )
}
