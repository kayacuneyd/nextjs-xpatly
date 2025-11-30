'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { FormProgress } from './FormProgress'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './ImageUpload'
import { MapboxAddressPicker } from './MapboxAddressPicker'
import { CreateListingInput, createListingSchema } from '@/lib/utils/validation'

export function CreateListingForm() {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  const steps = t.raw('createListing.steps') as string[]
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CreateListingInput>({
    // @ts-expect-error - Zod type inference issue with File[] defaults
    resolver: zodResolver(createListingSchema),
    mode: 'onChange',
    defaultValues: {
      property_type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 30,
      furnished: false,
      expat_friendly: false,
      price: 500,
      images: [] as File[],
      available_from: '',
    },
  })

  const formData = watch()

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateListingInput)[] = []

    switch (currentStep) {
      case 0: // Category
        fieldsToValidate = ['property_type']
        break
      case 1: // Address
        fieldsToValidate = ['address', 'city', 'latitude', 'longitude']
        break
      case 2: // Details
        fieldsToValidate = [
          'title',
          'description',
          'bedrooms',
          'bathrooms',
          'area_sqm',
          'furnished',
          'expat_friendly',
        ]
        break
      case 3: // Media
        fieldsToValidate = []
        break
      case 4: // Pricing
        fieldsToValidate = ['price']
        break
      case 5: // Availability
        fieldsToValidate = []
        break
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const onSubmit = async (data: CreateListingInput) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Append images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file)
        })
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create listing')
      }

      const result = await response.json()
      router.push(`/${locale}/listings/${result.id}`)
    } catch (error) {
      console.error('Error creating listing:', error)
      alert(error instanceof Error ? error.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormProgress steps={steps} currentStep={currentStep} />

      {/* @ts-expect-error - Type mismatch due to Zod inference with File[] */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 0: Category */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.categoryTitle')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {['apartment', 'house', 'room', 'studio'].map((type) => (
                <label
                  key={type}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                    formData.property_type === type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register('property_type')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {type === 'apartment' && '🏢'}
                      {type === 'house' && '🏠'}
                      {type === 'room' && '🚪'}
                      {type === 'studio' && '🏡'}
                    </div>
                    <div className="font-semibold capitalize">{t(`listings.propertyTypes.${type as 'apartment'}`)}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.property_type && (
              <p className="text-red-600 text-sm">{errors.property_type.message}</p>
            )}
          </div>
        )}

        {/* Step 1: Address */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.addressTitle')}</h2>
            <MapboxAddressPicker
              onLocationSelect={(location) => {
                setValue('address', location.address)
                setValue('city', location.city)
                setValue('latitude', location.latitude)
                setValue('longitude', location.longitude)
              }}
              initialLatitude={formData.latitude}
              initialLongitude={formData.longitude}
            />
            {(errors.address || errors.city || errors.latitude || errors.longitude) && (
              <p className="text-red-600 text-sm">Please select a location on the map</p>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.detailsTitle')}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.title')}</label>
              <input
                type="text"
                {...register('title')}
                className="w-full border rounded px-3 py-2"
                placeholder={t('createListing.titlePlaceholder')}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.description')}</label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full border rounded px-3 py-2"
                placeholder={t('createListing.descriptionPlaceholder')}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('createListing.bedrooms')}</label>
                <input
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
                {errors.bedrooms && (
                  <p className="text-red-600 text-sm mt-1">{errors.bedrooms.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('createListing.bathrooms')}</label>
                <input
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
                {errors.bathrooms && (
                  <p className="text-red-600 text-sm mt-1">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.area')}</label>
              <input
                type="number"
                step="0.01"
                {...register('area_sqm', { valueAsNumber: true })}
                className="w-full border rounded px-3 py-2"
                min="5"
              />
              {errors.area_sqm && (
                <p className="text-red-600 text-sm mt-1">{errors.area_sqm.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="furnished"
                {...register('furnished')}
                className="w-4 h-4"
              />
              <label htmlFor="furnished" className="text-sm font-medium">
                {t('createListing.furnished')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expat_friendly"
                {...register('expat_friendly')}
                className="w-4 h-4"
              />
              <label htmlFor="expat_friendly" className="text-sm font-medium">
                {t('createListing.expatFriendly')}
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.mediaTitle')}</h2>
            <ImageUpload
              images={formData.images || []}
              onChange={(files) => setValue('images', files)}
              maxImages={40}
            />
            {errors.images && (
              <p className="text-red-600 text-sm">{errors.images.message}</p>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.youtube')}</label>
              <input
                type="url"
                {...register('youtube_url')}
                className="w-full border rounded px-3 py-2"
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.youtube_url && (
                <p className="text-red-600 text-sm mt-1">{errors.youtube_url.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.pricingTitle')}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.monthlyRent')}</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Availability */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.availabilityTitle')}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">{t('createListing.availableFrom')}</label>
              <input
                type="date"
                {...register('available_from')}
                className="w-full border rounded px-3 py-2"
              />
              {errors.available_from && (
                <p className="text-red-600 text-sm mt-1">{errors.available_from.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('createListing.previewTitle')}</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600">{t('createListing.propertyType')}</h3>
                <p className="capitalize">{t(`listings.propertyTypes.${formData.property_type}`)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">{t('createListing.title')}</h3>
                <p>{formData.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">{t('createListing.preview.address')}</h3>
                <p>{formData.address}, {formData.city}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">{t('createListing.bedrooms')}</h3>
                  <p>{formData.bedrooms}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">{t('createListing.bathrooms')}</h3>
                  <p>{formData.bathrooms}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">{t('createListing.area')}</h3>
                  <p>{formData.area_sqm} m²</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">{t('createListing.preview.monthlyRent')}</h3>
                <p className="text-2xl font-bold">€{formData.price}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600">{t('createListing.features')}</h3>
                <div className="flex gap-2">
                  {formData.furnished && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {t('createListing.furnished')}
                    </span>
                  )}
                  {formData.expat_friendly && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {t('createListing.expatFriendly')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
          >
            {t('createListing.back')}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              {t('createListing.next')}
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('createListing.creating') : t('createListing.publish')}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
