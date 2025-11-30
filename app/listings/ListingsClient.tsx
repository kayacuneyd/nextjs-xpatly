'use client'

import { ListingCard } from '@/components/listings/ListingCard'
import { ListingsMap } from '@/components/listings/ListingsMap'
import { SearchFilters, type SearchFilters as SearchFiltersType } from '@/components/listings/SearchFilters'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Listing {
  id: string
  title: string
  price: number
  address: string
  city: string
  latitude: number
  longitude: number
  property_type: 'apartment' | 'house' | 'room' | 'studio'
  bedrooms: number
  bathrooms: number
  area_sqm: number
  furnished: boolean
  expat_friendly: boolean
  listing_images: { url: string; order: number }[]
}

type ViewMode = 'grid' | 'map'

export function ListingsClient() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setListings(data.listings || [])
      } else {
        console.error('Failed to fetch listings:', data.message)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchListings()
  }, [fetchListings])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <span className="hidden md:inline text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Xpatly
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <Link href={`/${locale}/listings`} className="hover:text-slate-900">
              {t('nav.listings')}
            </Link>
            <Link href={`/${locale}/listings/new`}>
              <Button size="sm">{t('nav.createListing')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('listings.title')}
              </h1>
              <p className="mt-2 text-gray-600">
                {t('listings.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('listings.viewModes.grid')}
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('listings.viewModes.map')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SearchFilters onFilterChange={setFilters} />
            </div>
          </div>

          {/* Listings Grid or Map */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t('listings.loading')}</p>
                </div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('listings.noListings')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('listings.noListingsDescription')}
                </p>
                <Link href={`/${locale}/listings/new`}>
                  <Button>{t('listings.createFirst')}</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {t('listings.found', { count: listings.length })}
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        price={listing.price}
                        address={listing.address}
                        city={listing.city}
                        property_type={listing.property_type}
                        bedrooms={listing.bedrooms}
                        bathrooms={listing.bathrooms}
                        area_sqm={listing.area_sqm}
                        furnished={listing.furnished}
                        expat_friendly={listing.expat_friendly}
                        image_url={
                          listing.listing_images
                            ?.sort((a, b) => a.order - b.order)[0]
                            ?.url
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-[700px]">
                    <ListingsMap
                      listings={listings}
                      onListingClick={(id) => router.push(`/${locale}/listings/${id}`)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
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
