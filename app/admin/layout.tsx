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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold">
                Xpatly Admin
              </Link>
              <span className="text-sm bg-blue-600 px-2 py-1 rounded capitalize">
                {role}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-4 space-y-2 sticky top-4">
              <Link
                href="/admin"
                className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/listings"
                className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                📝 Pending Listings
              </Link>
              <Link
                href="/admin/flagged"
                className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                🚩 Flagged Content
              </Link>
              <Link
                href="/admin/users"
                className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                👥 Users
              </Link>
              <div className="border-t pt-2 mt-2">
                <Link
                  href="/"
                  className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-500 text-sm"
                >
                  ← Back to Site
                </Link>
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
