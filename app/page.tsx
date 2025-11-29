import { getUser } from '@/lib/auth/actions'
import { UserNav } from '@/components/ui/user-nav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const user = await getUser()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            Xpatly
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <UserNav user={{ email: user.email! }} />
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Find Your Perfect Home in{' '}
              <span className="text-blue-600">Estonia</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Xpatly is the expat-friendly real estate platform. We fight housing
              discrimination and help you find welcoming homes in Estonia.
            </p>

            <div className="mt-10 flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/listings">
                    <Button size="lg">Browse Listings</Button>
                  </Link>
                  <Link href="/create-listing">
                    <Button size="lg" variant="outline">
                      Create Listing
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/listings">
                    <Button size="lg" variant="outline">
                      Browse Listings
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Features */}
            <div className="mt-20 grid gap-8 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-6">
                <div className="mb-2 text-2xl">✅</div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  Expat-Friendly Pledge
                </h3>
                <p className="text-sm text-slate-600">
                  All listings are screened for discriminatory language. No "locals
                  only" here.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <div className="mb-2 text-2xl">🗺️</div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  Map-Based Search
                </h3>
                <p className="text-sm text-slate-600">
                  Find homes by location, price, size, and more with our
                  interactive map.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <div className="mb-2 text-2xl">🌍</div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  Multi-Language
                </h3>
                <p className="text-sm text-slate-600">
                  Available in Estonian, English, and Russian for all expats.
                </p>
              </div>
            </div>

            {/* User Welcome Message */}
            {user && (
              <div className="mt-12 rounded-lg bg-blue-50 p-6 text-left">
                <h2 className="text-lg font-semibold text-blue-900">
                  Welcome back, {user.email}!
                </h2>
                <p className="mt-2 text-blue-700">
                  Your account is ready. Start browsing listings or create your own.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-600 sm:flex-row">
            <p>© 2025 Xpatly. Fighting housing discrimination in Estonia.</p>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-slate-900">
                About
              </Link>
              <Link href="/terms" className="hover:text-slate-900">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
