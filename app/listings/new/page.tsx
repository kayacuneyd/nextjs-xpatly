import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { CreateListingForm } from '@/components/listings/CreateListingForm'

export default async function NewListingPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/listings/new`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('createListing.pageTitle')}</h1>
          <p className="mt-2 text-gray-600">
            {t('createListing.pageSubtitle')}
          </p>
        </div>
        <CreateListingForm />
      </div>
    </div>
  )
}
