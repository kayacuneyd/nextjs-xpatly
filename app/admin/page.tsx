import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Disable caching to always show latest stats
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStats() {
  const supabase = await createClient()

  const [
    { count: totalListings },
    { count: pendingListings },
    { count: activeListings },
    { count: flaggedListings },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('flagged_content').select('*', { count: 'exact', head: true }).eq('reviewed', false),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalListings: totalListings || 0,
    pendingListings: pendingListings || 0,
    activeListings: activeListings || 0,
    flaggedListings: flaggedListings || 0,
    totalUsers: totalUsers || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: '📝',
      href: '/admin/listings',
    },
    {
      title: 'Pending Review',
      value: stats.pendingListings,
      icon: '⏳',
      href: '/admin/listings',
      highlight: stats.pendingListings > 0,
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      icon: '✅',
      href: '/admin/listings',
    },
    {
      title: 'Flagged Content',
      value: stats.flaggedListings,
      icon: '🚩',
      href: '/admin/flagged',
      highlight: stats.flaggedListings > 0,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      href: '/admin/users',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Overview of your platform activity and moderation queue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className={`bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition ${
              stat.highlight ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl sm:text-4xl">{stat.icon}</div>
            </div>
            {stat.highlight && (
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-orange-600 font-medium">
                Needs attention
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/admin/listings">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Review Pending Listings
            </Button>
          </Link>
          <Link href="/admin/flagged">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Review Flagged Content
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button className="w-full text-sm sm:text-base" variant="outline">
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Platform Health</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm sm:text-base text-gray-700">Approval Rate</span>
            <span className="font-semibold text-sm sm:text-base">
              {stats.totalListings > 0
                ? Math.round((stats.activeListings / stats.totalListings) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm sm:text-base text-gray-700">Pending Queue</span>
            <span className={`font-semibold text-sm sm:text-base ${stats.pendingListings > 5 ? 'text-orange-600' : 'text-green-600'}`}>
              {stats.pendingListings} listing{stats.pendingListings !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm sm:text-base text-gray-700">Flagged Items</span>
            <span className={`font-semibold text-sm sm:text-base ${stats.flaggedListings > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.flaggedListings} item{stats.flaggedListings !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
