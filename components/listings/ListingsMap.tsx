'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { useTranslations } from 'next-intl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Listing {
  id: string
  title: string
  price: number
  address: string
  city: string
  latitude: number
  longitude: number
  property_type: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  expat_friendly: boolean
}

interface ListingsMapProps {
  listings: Listing[]
  onListingClick?: (id: string) => void
}

export function ListingsMap({ listings, onListingClick }: ListingsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    if (!mapContainer.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      console.error('Mapbox token not found')
      return
    }

    mapboxgl.accessToken = mapboxToken

    // Initialize map centered on Tallinn
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [24.7536, 59.437],
      zoom: 11,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      // Clear markers
      markers.current.forEach((marker) => marker.remove())
      markers.current = []

      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || listings.length === 0) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    // Add markers for each listing
    const bounds = new mapboxgl.LngLatBounds()

    listings.forEach((listing) => {
      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">${listing.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${listing.city}</p>
          <div class="flex items-center gap-2 text-xs text-gray-700 mb-2">
            <span>🛏️ ${t('listingCard.bed', { count: listing.bedrooms })}</span>
            <span>🛁 ${t('listingCard.bath', { count: listing.bathrooms })}</span>
            <span>📐 ${listing.area_sqm}m²</span>
          </div>
          <p class="text-sm font-bold text-blue-600">€${listing.price}${t('listingCard.perMonth')}</p>
          ${
            listing.expat_friendly
              ? `<span class="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${t('listingCard.expatFriendly')}</span>`
              : ''
          }
        </div>
      `

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(popupContent)

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.innerHTML = `
        <div class="relative cursor-pointer">
          <div class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg hover:bg-blue-700 transition">
            €${listing.price}
          </div>
          ${
            listing.expat_friendly
              ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>'
              : ''
          }
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        if (onListingClick) {
          onListingClick(listing.id)
        }
      })

      markers.current.push(marker)
      bounds.extend([listing.longitude, listing.latitude])
    })

    // Fit map to show all markers
    if (listings.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      })
    }
  }, [listings, mapLoaded, onListingClick, t])

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('map.loading')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
