import { UserManagementActions } from '@/components/admin/UserManagementActions'
import { createClient } from '@/lib/supabase/server'

// Disable caching to always show latest users
export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdminUser = {
  id: string
  email: string | null
  role: string
  user_type: string
  is_verified: boolean
  is_approved: boolean
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

function getUserTypeLabel(userType: string) {
  switch (userType) {
    case 'landlord': return '🔑 Landlord'
    case 'tenant': return '🏠 Tenant'
    case 'both': return '🏡 Both'
    default: return userType
  }
}

function getUserTypeStyle(userType: string) {
  switch (userType) {
    case 'landlord': return 'bg-amber-100 text-amber-800'
    case 'tenant': return 'bg-cyan-100 text-cyan-800'
    case 'both': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function UsersPage() {
  const users = await getUsers()
  const pendingUsers = users.filter(u => !u.is_approved && !u.is_banned)
  const approvedUsers = users.filter(u => u.is_approved)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500">Total Users</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
          <div className="text-xs text-orange-600">Pending Approval</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
          <div className="text-xs text-green-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">
            {users.filter(u => u.user_type === 'landlord' || u.user_type === 'both').length}
          </div>
          <div className="text-xs text-gray-500">Landlords</div>
        </div>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-orange-800 mb-3">
            ⏳ Pending Approval ({pendingUsers.length})
          </h2>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">
                        {user.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getUserTypeStyle(user.user_type)}`}>
                          {getUserTypeLabel(user.user_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Registered {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UserManagementActions
                      userId={user.id}
                      currentRole={user.role}
                      userType={user.user_type}
                      isVerified={user.is_verified}
                      isApproved={user.is_approved}
                      isBanned={user.is_banned}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  Type
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeStyle(user.user_type)}`}>
                      {getUserTypeLabel(user.user_type)}
                    </span>
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
                    <div className="flex flex-wrap items-center gap-1">
                      {user.is_approved ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          ⏳ Pending
                        </span>
                      )}
                      {user.is_verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          ✓ Verified
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          🚫 Banned
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
                      userType={user.user_type}
                      isVerified={user.is_verified}
                      isApproved={user.is_approved}
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeStyle(user.user_type)}`}>
                {getUserTypeLabel(user.user_type)}
              </span>
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
              {user.is_approved ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                  ⏳ Pending
                </span>
              )}
              {user.is_verified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  ✓ Verified
                </span>
              )}
              {user.is_banned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  🚫 Banned
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
                userType={user.user_type}
                isVerified={user.is_verified}
                isApproved={user.is_approved}
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
