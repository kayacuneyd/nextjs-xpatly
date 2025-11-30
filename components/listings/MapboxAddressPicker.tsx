'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type GeocodeFeature = {
  place_name?: string
  context?: Array<{ id: string; text: string }>
  center: [number, number]
}

type GeocodeResponse = {
  features?: GeocodeFeature[]
}

interface MapboxAddressPickerProps {
  onLocationSelect: (data: {
    address: string
    city: string
    latitude: number
    longitude: number
  }) => void
  initialLatitude?: number
  initialLongitude?: number
}

export function MapboxAddressPicker({
  onLocationSelect,
  initialLatitude = 59.437,
  initialLongitude = 24.7536,
}: MapboxAddressPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [address, setAddress] = useState('')

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      )
      const data = (await response.json()) as GeocodeResponse

      if (data.features && data.features.length > 0) {
        const place = data.features[0]
        const addressText = place.place_name || 'Unknown location'

        // Extract city from context
        let city = 'Tallinn'
        if (place.context) {
          const cityContext = place.context.find((c) => c.id.startsWith('place.'))
          if (cityContext) {
            city = cityContext.text
          }
        }

        setAddress(addressText)
        onLocationSelect({
          address: addressText,
          city,
          latitude: lat,
          longitude: lng,
        })
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
  }, [onLocationSelect])

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) return

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&country=EE&limit=5`
      )
      const data = (await response.json()) as GeocodeResponse

      if (data.features && data.features.length > 0) {
        const place = data.features[0]
        const [lng, lat] = place.center

        if (map.current) {
          map.current.flyTo({ center: [lng, lat], zoom: 14 })
        }

        if (marker.current) {
          marker.current.setLngLat([lng, lat])
        }

        await reverseGeocode(lng, lat)
      }
    } catch (error) {
      console.error('Error searching address:', error)
    }
  }, [reverseGeocode])

  useEffect(() => {
    if (!mapContainer.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      console.error('Mapbox token not found')
      return
    }

    mapboxgl.accessToken = mapboxToken

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLongitude, initialLatitude],
      zoom: 12,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add initial marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#3B82F6',
    })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map.current)

    // Handle marker drag end
    marker.current.on('dragend', async () => {
      if (!marker.current) return
      const lngLat = marker.current.getLngLat()
      await reverseGeocode(lngLat.lng, lngLat.lat)
    })

    // Handle map click
    map.current.on('click', async (e) => {
      if (!marker.current) return
      marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat])
      await reverseGeocode(e.lngLat.lng, e.lngLat.lat)
    })

    // Initial reverse geocode
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reverseGeocode(initialLongitude, initialLatitude)

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [initialLatitude, initialLongitude, reverseGeocode])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Search Address
        </label>
        <input
          type="text"
          placeholder="Type an address in Estonia..."
          className="w-full border rounded px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              searchAddress(e.currentTarget.value)
            }
          }}
          onBlur={(e) => searchAddress(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to search, or click/drag the marker on the map
        </p>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg border-2 border-gray-300"
      />

      {/* Selected Address Display */}
      {address && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl">📍</span>
            <div>
              <div className="font-semibold text-sm text-blue-900">Selected Location:</div>
              <div className="text-sm text-blue-800">{address}</div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Tip: Click anywhere on the map or drag the marker to select a location
      </p>
    </div>
  )
}
