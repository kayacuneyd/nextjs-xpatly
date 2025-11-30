import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

async function getListing(id: string) {
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !listing) {
    return null
  }

  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('order', { ascending: true })

  return { listing, images: images ?? [] }
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const t = await getTranslations()
  const locale = await getLocale()
  const data = await getListing(id)

  if (!data) {
    notFound()
  }

  const { listing, images } = data
  const heroImage = images[0]?.url
  const yes = t('common.yes')
  const no = t('common.no')
  const statusKey = ['pending', 'active', 'rejected', 'archived'].includes(
    listing.status
  )
    ? (listing.status as 'pending' | 'active' | 'rejected' | 'archived')
    : 'pending'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('listings.details.listingId', { id: listing.id })}</p>
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <p className="mt-1 text-gray-600">
              {listing.address}, {listing.city}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 capitalize">
            {t(`listings.details.status.${statusKey}`)}
          </span>
        </div>

        {heroImage ? (
          <div className="w-full overflow-hidden rounded-2xl bg-gray-200">
            <img
              src={heroImage}
              alt={listing.title}
              className="h-[320px] w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            {t('listings.details.noPhotos')}
          </div>
        )}

        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1).map((img) => (
              <div key={img.id ?? img.url} className="overflow-hidden rounded-xl bg-gray-200">
                <img src={img.url} alt={listing.title} className="h-48 w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900">{t('listings.details.description')}</h2>
            <p className="leading-7 text-gray-700 whitespace-pre-line">{listing.description}</p>
          </div>
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{t('listings.details.details')}</h2>
            <dl className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <dt>{t('listings.details.priceLabel')}</dt>
                <dd className="font-semibold">€{listing.price}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.propertyType')}</dt>
                <dd className="capitalize">{t(`listings.propertyTypes.${listing.property_type}`)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.bedroomsLabel')}</dt>
                <dd>{listing.bedrooms}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.bathroomsLabel')}</dt>
                <dd>{listing.bathrooms}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.areaLabel')}</dt>
                <dd>{listing.area_sqm} m²</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.furnished')}</dt>
                <dd>{listing.furnished ? yes : no}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t('listings.details.expatFriendly')}</dt>
                <dd>{listing.expat_friendly ? yes : no}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/${locale}/listings`} className="text-blue-600 hover:text-blue-700">
            {t('listings.details.backToListings')}
          </Link>
          {listing.youtube_url && (
            <a
              href={listing.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              {t('listings.details.watchVideo')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
