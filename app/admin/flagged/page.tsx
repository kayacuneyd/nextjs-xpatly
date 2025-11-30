import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ApproveRejectButtons } from '@/components/admin/ApproveRejectButtons'

// Disable caching to always show latest flagged content
export const dynamic = 'force-dynamic'
export const revalidate = 0

type FlaggedListing = {
  id: string
  title: string
  description: string
  address: string
  city: string
  price: number
  property_type: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  furnished: boolean
  expat_friendly: boolean
  status: string
  created_at: string
  users?: { email: string | null } | null
  listing_images?: { url: string; order: number }[]
}

type FlaggedItem = {
  id: string
  reason: string
  flagged_text?: string
  created_at: string
  listings: FlaggedListing | null
}

async function getFlaggedContent(): Promise<FlaggedItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('flagged_content')
    .select(`
      *,
      listings (
        id,
        title,
        description,
        address,
        city,
        price,
        property_type,
        bedrooms,
        bathrooms,
        area_sqm,
        furnished,
        expat_friendly,
        status,
        created_at,
        users (
          email
        ),
        listing_images (
          url,
          order
        )
      )
    `)
    .eq('reviewed', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching flagged content:', error)
    return []
  }

  return data || []
}

export default async function FlaggedContentPage() {
  const flaggedItems = await getFlaggedContent()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Flagged Content</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Review listings flagged by the Expat-Friendly Pledge system
        </p>
      </div>

      {flaggedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">✅</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            There are no flagged listings to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedItems.map((item) => {
            const listing = item.listings
            if (!listing) return null

            const mainImage = listing.listing_images
              ?.slice()
              .sort((a, b) => a.order - b.order)[0]?.url

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-red-500"
              >
                <div className="flex flex-col md:grid md:grid-cols-4 gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={listing.title}
                        className="w-full h-40 sm:h-48 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-gray-200 rounded flex items-center justify-center text-4xl">
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 space-y-2 sm:space-y-3">
                    {/* Flag Alert */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 text-base sm:text-lg">🚩</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-red-900">
                            Flagged: {item.reason}
                          </h3>
                          {item.flagged_text && (
                            <p className="text-xs sm:text-sm text-red-700 mt-1 break-all">
                              Detected phrase: &quot;{item.flagged_text}&quot;
                            </p>
                          )}
                          <p className="text-xs text-red-600 mt-1">
                            Flagged on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600"
                        target="_blank"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {listing.address}, {listing.city}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base text-gray-700 line-clamp-2 sm:line-clamp-3">
                      {listing.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span>🛏️ {listing.bedrooms} bed</span>
                      <span>🛁 {listing.bathrooms} bath</span>
                      <span>📐 {listing.area_sqm} m²</span>
                      <span className="font-semibold text-blue-600">
                        €{listing.price}/mo
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 sm:py-1 rounded text-xs capitalize">
                        {listing.property_type}
                      </span>
                      {listing.furnished && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 sm:py-1 rounded text-xs">
                          Furnished
                        </span>
                      )}
                      {listing.expat_friendly && (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded text-xs">
                          Expat-Friendly
                        </span>
                      )}
                      <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                        listing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : listing.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Posted by: {listing.users?.email || 'Unknown'} •{' '}
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex md:flex-col justify-end md:justify-center gap-2 sm:gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                    {listing.status === 'pending' && (
                      <ApproveRejectButtons listingId={listing.id} />
                    )}
                    {listing.status !== 'pending' && (
                      <div className="text-center text-xs sm:text-sm text-gray-600">
                        Already {listing.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
