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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}`} className="text-2xl font-bold text-slate-900">
            Xpatly
          </Link>

          <nav className="flex items-center gap-6">
            <LanguageSwitcher />
            {user ? (
              <UserNav user={{ email: user.email! }} />
            ) : (
              <div className="flex items-center gap-4">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost">{t('nav.login')}</Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button>{t('nav.register')}</Button>
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
              {t('home.hero.title', { country })}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-10 flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/listings">
                    <Button size="lg">{t('nav.listings')}</Button>
                  </Link>
                  <Link href={`/${locale}/listings/new`}>
                    <Button size="lg" variant="outline">
                      {t('nav.createListing')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/register`}>
                    <Button size="lg">{t('home.cta.getStarted')}</Button>
                  </Link>
                  <Link href={`/${locale}/listings`}>
                    <Button size="lg" variant="outline">
                      {t('home.cta.browse')}
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
                  {t('home.features.expatFriendly.title')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('home.features.expatFriendly.description')}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <div className="mb-2 text-2xl">🗺️</div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {t('home.features.verified.title')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('home.features.verified.description')}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-6">
                <div className="mb-2 text-2xl">🌍</div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {t('home.features.multiLanguage.title')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('home.features.multiLanguage.description')}
                </p>
              </div>
            </div>

            {/* User Welcome Message */}
            {user && (
              <div className="mt-12 rounded-lg bg-blue-50 p-6 text-left">
                <h2 className="text-lg font-semibold text-blue-900">
                  {t('home.welcome.title', { email: user.email! })}
                </h2>
                <p className="mt-2 text-blue-700">
                  {t('home.welcome.subtitle')}
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
            <p>{t('common.footer')}</p>
            <div className="flex gap-6">
              <Link href={`/${locale}/about`} className="hover:text-slate-900">
                {t('nav.about')}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-slate-900">
                {t('nav.terms')}
              </Link>
              <Link href={`/${locale}/privacy`} className="hover:text-slate-900">
                {t('nav.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
