import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth/actions'
import { UserNav } from '@/components/ui/user-nav'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default async function Home() {
  const t = await getTranslations()
  const locale = await getLocale()
  const user = await getUser()
  const country = t('home.hero.country')

  return (
    <div className="flex min-h-screen flex-col bg-white">
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
              {t('nav.listings')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900 font-medium transition">
              {t('nav.about')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <UserNav user={{ email: user.email! }} />
            ) : (
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
          
          <div className="relative container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                No discrimination • Housing for everyone
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">Find Your </span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Expat-Friendly
                </span>
                <br />
                <span className="text-gray-900">Home in </span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {country}
                </span>
              </h1>
              
              <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link href={`/${locale}/listings`}>
                      <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 rounded-xl">
                        🏠 {t('nav.listings')}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/create-listing`}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-200 hover:border-gray-300 rounded-xl">
                        ➕ {t('nav.createListing')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/register`}>
                      <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 rounded-xl">
                        🚀 {t('home.cta.getStarted')}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/listings`}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-200 hover:border-gray-300 rounded-xl">
                        👀 {t('home.cta.browse')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Verified Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We&apos;re committed to making housing accessible and fair for everyone
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('home.features.expatFriendly.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.expatFriendly.description')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('home.features.verified.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.verified.description')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('home.features.multiLanguage.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.features.multiLanguage.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-blue-200">Active Listings</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1,200+</div>
                <div className="text-blue-200">Happy Tenants</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-blue-200">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">4.9★</div>
                <div className="text-blue-200">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find your perfect home in just 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search</h3>
                <p className="text-gray-600">Browse through verified listings with our powerful search filters</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
                <p className="text-gray-600">Contact landlords directly through our secure messaging system</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Move In</h3>
                <p className="text-gray-600">Sign your lease and enjoy your new expat-friendly home</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 shadow-2xl shadow-blue-500/25">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Find Your New Home?
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of expats who have found their perfect home through Xpatly. No discrimination, just housing for everyone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/${locale}/register`}>
                  <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold">
                    Get Started Free
                  </Button>
                </Link>
                <Link href={`/${locale}/listings`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 rounded-xl">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* User Welcome Message */}
        {user && (
          <section className="py-12 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('home.welcome.title', { email: user.email! })}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('home.welcome.subtitle')}
                </p>
                <Link href={`/${locale}/dashboard`}>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
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
                <li><Link href="/en" className="hover:text-white transition">🇬🇧 English</Link></li>
                <li><Link href="/et" className="hover:text-white transition">🇪🇪 Eesti</Link></li>
                <li><Link href="/ru" className="hover:text-white transition">🇷🇺 Русский</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{t('common.footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
