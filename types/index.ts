// User types
export type UserRole = 'super_admin' | 'moderator' | 'owner' | 'user'

export interface User {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  is_banned: boolean
  created_at: string
}

// Listing types
export type PropertyType = 'apartment' | 'house' | 'room' | 'studio'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'archived'

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  address: string
  city: string
  district: string | null
  latitude: number
  longitude: number
  price: number
  property_type: PropertyType
  bedrooms: number
  bathrooms: number
  area_sqm: number
  furnished: boolean
  expat_friendly: boolean
  youtube_url: string | null
  status: ListingStatus
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  order: number
  created_at: string
}

export interface ListingWithImages extends Listing {
  images: ListingImage[]
}

// Search types
export interface SearchFilters {
  city?: string
  district?: string
  price_min?: number
  price_max?: number
  property_type?: PropertyType
  bedrooms?: number
  bathrooms?: number
  area_min?: number
  area_max?: number
  furnished?: boolean
  expat_friendly?: boolean
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  filters: SearchFilters
  notify_email: boolean
  created_at: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  listing_id: string | null
  type: 'new_match' | 'listing_approved' | 'listing_rejected' | 'admin_message'
  title: string
  message: string
  read: boolean
  created_at: string
}

// Admin types
export interface FlaggedContent {
  id: string
  listing_id: string
  reason: string
  flagged_text: string
  reviewed: boolean
  reviewed_by: string | null
  reviewed_at: string | null
  action_taken: 'approved' | 'rejected' | null
  created_at: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: 'approve_listing' | 'reject_listing' | 'ban_user' | 'verify_user' | 'delete_listing'
  target_id: string
  reason: string | null
  created_at: string
}

// Form types
export interface CreateListingFormData {
  // Step 1: Category
  property_type: PropertyType

  // Step 2: Address
  address: string
  city: string
  district: string
  latitude: number
  longitude: number

  // Step 3: Details
  title: string
  description: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  furnished: boolean
  expat_friendly: boolean

  // Step 4: Media
  images: File[]
  youtube_url?: string

  // Step 5: Pricing
  price: number

  // Step 6: Availability
  available_from: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
