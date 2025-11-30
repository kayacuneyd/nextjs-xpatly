import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UserNav } from '@/components/ui/user-nav'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type UserListing = {
  id: string
  title: string
  city: string
  price: string
  status: string
  created_at: string
  listing_images: { url: string; order: number }[]
}

type UserProfile = {
  id: string
  email: string
  role: string
  user_type: string
  is_verified: boolean
  is_approved: boolean
  is_banned: boolean
  created_at: string
}

async function getUserData() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { user: null, profile: null, listings: [] }
  }

  // Use admin client to bypass RLS for user profile
  const { data: profile } = await adminSupabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user listings (this might also need admin client if RLS is problematic)
  const { data: listings } = await adminSupabase
    .from('listings')
    .select(`
      id,
      title,
      city,
      price,
      status,
      created_at,
      listing_images (url, order)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { 
    user, 
    profile: profile as UserProfile | null, 
    listings: (listings || []) as UserListing[] 
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">✓ Active</span>
    case 'pending':
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending</span>
    case 'rejected':
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">✗ Rejected</span>
    case 'archived':
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">📦 Archived</span>
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
  }
}

function getUserTypeLabel(userType: string) {
  switch (userType) {
    case 'landlord': return '🔑 Landlord'
    case 'tenant': return '🏠 Tenant'
    case 'both': return '🏡 Both'
    default: return userType
  }
}

export default async function DashboardPage() {
  const { user, profile, listings } = await getUserData()
  const locale = await getLocale()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Admins should not access user dashboard - redirect to admin dashboard
  if (profile?.role === 'super_admin' || profile?.role === 'moderator') {
    redirect('/admin')
  }

  const activeListings = listings.filter(l => l.status === 'active')
  const pendingListings = listings.filter(l => l.status === 'pending')
  const rejectedListings = listings.filter(l => l.status === 'rejected')

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
            <UserNav user={{ email: user.email! }} />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your account and listings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-blue-600">
                      {profile?.email?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <h2 className="mt-4 text-white font-semibold text-lg break-all">
                    {profile?.email}
                  </h2>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                      {getUserTypeLabel(profile?.user_type || 'tenant')}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Account Status */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.is_approved ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">✓ Approved</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending Approval</span>
                      )}
                      {profile?.is_verified && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">✓ Verified</span>
                      )}
                      {profile?.is_banned && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🚫 Banned</span>
                      )}
                    </div>
                  </div>

                  {/* Member Since */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                    <p className="text-gray-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                    <p className="text-gray-900 capitalize">{profile?.role?.replace('_', ' ') || 'User'}</p>
                  </div>

                  {/* Edit Profile Button */}
                  <Link
                    href="/dashboard/profile"
                    className="block w-full text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                  >
                    ✏️ Edit Profile
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
                    <div className="text-xs text-blue-600">Total Listings</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{activeListings.length}</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{pendingListings.length}</div>
                    <div className="text-xs text-yellow-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{rejectedListings.length}</div>
                    <div className="text-xs text-red-600">Rejected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Listings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                  <Link
                    href="/create-listing"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    + Create Listing
                  </Link>
                </div>

                {listings.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-4">🏠</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h4>
                    <p className="text-gray-600 mb-6">Create your first listing to start renting your property</p>
                    <Link
                      href="/create-listing"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                    >
                      + Create Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {listings.map((listing) => {
                      const mainImage = listing.listing_images?.find(img => img.order === 0)?.url
                      return (
                        <div key={listing.id} className="p-4 sm:p-6 hover:bg-gray-50 transition">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Image */}
                            <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                              {mainImage ? (
                                <img
                                  src={mainImage}
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  📷
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {listing.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    📍 {listing.city}
                                  </p>
                                </div>
                                {getStatusBadge(listing.status)}
                              </div>

                              <div className="mt-2 flex items-center gap-4 text-sm">
                                <span className="font-semibold text-blue-600">
                                  €{Number(listing.price).toLocaleString()}/month
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                  Created {new Date(listing.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                  href={`/listings/${listing.id}`}
                                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                                >
                                  👁️ View
                                </Link>
                                <Link
                                  href={`/dashboard/listings/${listing.id}/edit`}
                                  className="px-3 py-1.5 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                                >
                                  ✏️ Edit
                                </Link>
                                {listing.status === 'active' && (
                                  <button className="px-3 py-1.5 text-xs font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition">
                                    📦 Archive
                                  </button>
                                )}
                                <button className="px-3 py-1.5 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded transition">
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                <li><Link href="/en/dashboard" className="hover:text-white transition">🇬🇧 English</Link></li>
                <li><Link href="/et/dashboard" className="hover:text-white transition">🇪🇪 Eesti</Link></li>
                <li><Link href="/ru/dashboard" className="hover:text-white transition">🇷🇺 Русский</Link></li>
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
