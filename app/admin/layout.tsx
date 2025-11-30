import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role } = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white border-b border-slate-700">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link href="/" className="text-lg sm:text-xl font-bold">
                Xpatly Admin
              </Link>
              <span className="text-xs sm:text-sm bg-blue-600 px-2 py-1 rounded capitalize">
                {role}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-300 truncate max-w-[120px] sm:max-w-none">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Sidebar Navigation - Horizontal on mobile, vertical on desktop */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-2 sm:p-4 lg:sticky lg:top-4">
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 sm:gap-2 pb-2 lg:pb-0">
                <Link
                  href="/admin"
                  className="shrink-0 px-3 sm:px-4 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/listings"
                  className="shrink-0 px-3 sm:px-4 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm sm:text-base whitespace-nowrap"
                >
                  📝 Pending Listings
                </Link>
                <Link
                  href="/admin/flagged"
                  className="shrink-0 px-3 sm:px-4 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm sm:text-base whitespace-nowrap"
                >
                  🚩 Flagged Content
                </Link>
                <Link
                  href="/admin/users"
                  className="shrink-0 px-3 sm:px-4 py-2 rounded hover:bg-gray-100 text-gray-700 text-sm sm:text-base whitespace-nowrap"
                >
                  👥 Users
                </Link>
                <div className="hidden lg:block border-t pt-2 mt-2">
                  <Link
                    href="/"
                    className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-500 text-sm"
                  >
                    ← Back to Site
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
