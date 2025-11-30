'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  city?: string
  property_type?: string
  price_min?: number
  price_max?: number
  bedrooms?: number
  furnished?: boolean
  expat_friendly?: boolean
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const t = useTranslations()

  const handleChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('listings.filters.title')}</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? t('listings.filters.showLess') : t('listings.filters.showMore')}
        </button>
      </div>

      <div className="space-y-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('listings.filters.city')}
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">{t('listings.filters.allCities')}</option>
            <option value="Tallinn">Tallinn</option>
            <option value="Tartu">Tartu</option>
            <option value="Narva">Narva</option>
            <option value="Pärnu">Pärnu</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('listings.filters.propertyType')}
          </label>
          <select
            value={filters.property_type || ''}
            onChange={(e) =>
              handleChange('property_type', e.target.value || undefined)
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">{t('listings.propertyTypes.all')}</option>
            <option value="apartment">{t('listings.propertyTypes.apartment')}</option>
            <option value="house">{t('listings.propertyTypes.house')}</option>
            <option value="room">{t('listings.propertyTypes.room')}</option>
            <option value="studio">{t('listings.propertyTypes.studio')}</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('listings.filters.priceHint')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={t('listings.filters.minPrice')}
              value={filters.price_min || ''}
              onChange={(e) =>
                handleChange(
                  'price_min',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder={t('listings.filters.maxPrice')}
              value={filters.price_max || ''}
              onChange={(e) =>
                handleChange(
                  'price_max',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listings.filters.minBedrooms')}
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) =>
                  handleChange(
                    'bedrooms',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">{t('listings.filters.any')}</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.furnished || false}
                  onChange={(e) => handleChange('furnished', e.target.checked || undefined)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{t('listings.filters.furnished')}</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.expat_friendly || false}
                  onChange={(e) =>
                    handleChange('expat_friendly', e.target.checked || undefined)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{t('listings.filters.expatFriendly')}</span>
              </label>
            </div>
          </>
        )}

        {/* Clear Filters */}
        {Object.keys(filters).length > 0 && (
          <Button
            onClick={clearFilters}
            variant="outline"
            className="w-full"
          >
            {t('listings.filters.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  )
}
