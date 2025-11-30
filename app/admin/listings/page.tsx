import { ApproveRejectButtons } from '@/components/admin/ApproveRejectButtons'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Disable caching to always show latest listings
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PendingListing = {
  id: string
  title: string
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  price: number
  property_type: string
  furnished: boolean
  expat_friendly: boolean
  description: string
  created_at: string
  listing_images?: { url: string; order: number }[]
  users?: { email: string | null } | null
}

async function getPendingListings(): Promise<PendingListing[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users (
        email
      ),
      listing_images (
        url,
        order
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending listings:', error)
    return []
  }

  return data || []
}

export default async function AdminListingsPage() {
  const pendingListings = await getPendingListings()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Listings</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Review and moderate listings waiting for approval
        </p>
      </div>

      {pendingListings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4">✅</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            There are no pending listings to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((listing) => {
            const mainImage = listing.listing_images
              ?.slice()
              .sort((a, b) => a.order - b.order)[0]?.url

            return (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition"
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
                    </div>

                    <div className="text-xs text-gray-500">
                      Posted by: {listing.users?.email || 'Unknown'} •{' '}
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex md:flex-col justify-end md:justify-center gap-2 sm:gap-3 pt-3 md:pt-0 border-t md:border-t-0">
                    <ApproveRejectButtons listingId={listing.id} />
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
