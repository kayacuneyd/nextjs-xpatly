import { createAdminClient, createClient } from '@/lib/supabase/server'
import { checkBlockedPhrases } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()

    // Extract listing data
    const listingData = {
      property_type: formData.get('property_type') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string | null,
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
      price: parseFloat(formData.get('price') as string),
      bedrooms: parseInt(formData.get('bedrooms') as string),
      bathrooms: parseInt(formData.get('bathrooms') as string),
      area_sqm: parseFloat(formData.get('area_sqm') as string),
      furnished: formData.get('furnished') === 'true',
      expat_friendly: formData.get('expat_friendly') === 'true',
      youtube_url: formData.get('youtube_url') as string | null,
    }

    // Check for blocked phrases (Expat-Friendly Pledge)
    const titleBlocked = checkBlockedPhrases(listingData.title)
    const descBlocked = checkBlockedPhrases(listingData.description)

    if (titleBlocked || descBlocked) {
      // Create listing with 'pending' status and flag it
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          ...listingData,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single()

      if (listingError) {
        console.error('Error creating flagged listing:', listingError)
        return NextResponse.json(
          { message: 'Failed to create listing' },
          { status: 500 }
        )
      }

      // Create flagged content record
      await supabase.from('flagged_content').insert({
        listing_id: listing.id,
        reason: 'Blocked phrase detected',
        flagged_text: titleBlocked || descBlocked || '',
      })

      return NextResponse.json(
        {
          message:
            'Your listing has been submitted for review due to content policy.',
          id: listing.id,
          flagged: true,
        },
        { status: 201 }
      )
    }

    // Get images from form data
    const imageFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key === 'images' && value instanceof File) {
        imageFiles.push(value)
      }
    }

    // Check if user is verified (for auto-approval)
    const { data: userData } = await supabase
      .from('users')
      .select('is_verified')
      .eq('id', user.id)
      .single()

    const status = userData?.is_verified ? 'active' : 'pending'

    // Create listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        user_id: user.id,
        status,
      })
      .select()
      .single()

    if (listingError) {
      console.error('Error creating listing:', listingError)
      return NextResponse.json(
        { message: 'Failed to create listing' },
        { status: 500 }
      )
    }

    // Upload images to Supabase Storage
    const imageUrls: { url: string; order: number }[] = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${listing.id}/${Date.now()}_${i}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listings')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('listings').getPublicUrl(uploadData.path)

      imageUrls.push({ url: publicUrl, order: i })
    }

    // Insert image records
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((img) => ({
        listing_id: listing.id,
        url: img.url,
        order: img.order,
      }))

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imageRecords)

      if (imagesError) {
        console.error('Error saving image records:', imagesError)
      }
    }

    return NextResponse.json(
      {
        message: status === 'active' ? 'Listing created successfully' : 'Listing submitted for review',
        id: listing.id,
        status,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/listings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    // Build query - only show active listings to public
    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_images (
          url,
          order
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    const city = searchParams.get('city')
    if (city) {
      query = query.eq('city', city)
    }

    const property_type = searchParams.get('property_type')
    if (property_type) {
      query = query.eq('property_type', property_type)
    }

    const price_min = searchParams.get('price_min')
    if (price_min) {
      query = query.gte('price', Number(price_min))
    }

    const price_max = searchParams.get('price_max')
    if (price_max) {
      query = query.lte('price', Number(price_max))
    }

    const bedrooms = searchParams.get('bedrooms')
    if (bedrooms) {
      query = query.gte('bedrooms', Number(bedrooms))
    }

    const furnished = searchParams.get('furnished')
    if (furnished === 'true') {
      query = query.eq('furnished', true)
    }

    const expat_friendly = searchParams.get('expat_friendly')
    if (expat_friendly === 'true') {
      query = query.eq('expat_friendly', true)
    }

    const { data: listings, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json(
        { message: 'Failed to fetch listings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ listings }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/listings:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
