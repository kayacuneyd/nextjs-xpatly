'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface ListingCardProps {
  id: string
  title: string
  price: number
  address: string
  city: string
  property_type: 'apartment' | 'house' | 'room' | 'studio'
  bedrooms: number
  bathrooms: number
  area_sqm: number
  furnished: boolean
  expat_friendly: boolean
  image_url?: string
}

export function ListingCard({
  id,
  title,
  price,
  address,
  city,
  property_type,
  bedrooms,
  bathrooms,
  area_sqm,
  furnished,
  expat_friendly,
  image_url,
}: ListingCardProps) {
  const locale = useLocale()
  const t = useTranslations()
  const propertyTypeEmoji = {
    apartment: '🏢',
    house: '🏠',
    room: '🚪',
    studio: '🏡',
  }

  return (
    <Link href={`/${locale}/listings/${id}`}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              {propertyTypeEmoji[property_type]}
            </div>
          )}
          {expat_friendly && (
            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
              {t('listingCard.expatFriendly')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
              {title}
            </h3>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-1">
              {address ? `${address}, ${city}` : city}
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
            <div className="flex items-center gap-1">
              <span>🛏️</span>
              <span>{t('listingCard.bed', { count: bedrooms })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🛁</span>
              <span>{t('listingCard.bath', { count: bathrooms })}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📐</span>
              <span>{area_sqm} m²</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
              {t(`listings.propertyTypes.${property_type}`)}
            </span>
            {furnished && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {t('listingCard.furnished')}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">€{price}</span>
              <span className="text-sm text-gray-600 ml-1">{t('listingCard.perMonth')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
