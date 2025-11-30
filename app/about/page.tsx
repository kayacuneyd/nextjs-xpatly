import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth/actions'
import { UserNav } from '@/components/ui/user-nav'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default async function AboutPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const user = await getUser()

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
            <Link href={`/${locale}/about`} className="text-blue-600 font-medium">
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

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Xpatly</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We&apos;re on a mission to make housing fair and accessible for everyone in Estonia, 
                regardless of nationality or background.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Xpatly was born from a simple observation: too many expats in Estonia face discrimination 
                    when trying to find housing. &quot;No foreigners&quot;, &quot;Estonians only&quot;, &quot;Russian speakers 
                    not welcome&quot; – these phrases are unfortunately all too common in the rental market.
                  </p>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We believe that everyone deserves a fair chance at finding a home. That&apos;s why we 
                    created Xpatly – a platform where landlords commit to the Expat-Friendly Pledge, 
                    ensuring that all listings are free from discrimination.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our team reviews every listing to ensure it meets our standards, creating a safe 
                    space for expats to find their next home.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Housing for Everyone</h3>
                    <p className="text-gray-600">No discrimination. No barriers. Just homes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Fairness</h3>
                  <p className="text-gray-600">
                    Every person deserves equal treatment in their search for housing. We enforce 
                    strict anti-discrimination policies on all listings.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
                  <p className="text-gray-600">
                    All listings are verified by our team. What you see is what you get – no hidden 
                    fees, no surprises, no discrimination.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
                  <p className="text-gray-600">
                    We&apos;re building a community of landlords and tenants who believe in fair housing. 
                    Together, we can change the rental market.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Expat-Friendly Pledge */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Expat-Friendly Pledge</h2>
              <p className="text-xl text-blue-100 mb-8">
                Every landlord on Xpatly agrees to our Expat-Friendly Pledge:
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">I will not discriminate based on nationality, ethnicity, or language</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">I will treat all applicants fairly and equally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">I will provide accurate information about my property</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">I will respond to inquiries in a timely and professional manner</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by Expats, for Expats</h2>
              <p className="text-xl text-gray-600 mb-12">
                We understand the challenges of finding housing in a new country because we&apos;ve 
                experienced them ourselves. Our team is made up of expats from various countries 
                who are passionate about making housing accessible.
              </p>
              <div className="flex justify-center gap-4">
                <Link href={`/${locale}/register`}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl px-8">
                    Join Xpatly Today
                  </Button>
                </Link>
                <Link href={`/${locale}/listings`}>
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 rounded-xl px-8">
                    Browse Listings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions or feedback? We&apos;d love to hear from you.
              </p>
              <a 
                href="mailto:hello@xpatly.com" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hello@xpatly.com
              </a>
            </div>
          </div>
        </section>
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
                <li><Link href="/en/about" className="hover:text-white transition">🇬🇧 English</Link></li>
                <li><Link href="/et/about" className="hover:text-white transition">🇪🇪 Eesti</Link></li>
                <li><Link href="/ru/about" className="hover:text-white transition">🇷🇺 Русский</Link></li>
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
