import { z } from 'zod'

// ============================================
// LISTING VALIDATION
// ============================================

// Blocked phrases for Expat-Friendly Pledge
export const BLOCKED_PHRASES = [
  'locals only',
  'no foreigners',
  'eestlastele',
  'ainult kohalikud',
  'only estonians',
  'ainult eestlased',
  'no immigrants',
  'mitte välismaalased',
] as const

export function checkBlockedPhrases(text: string): string | null {
  const lowerText = text.toLowerCase()
  for (const phrase of BLOCKED_PHRASES) {
    if (lowerText.includes(phrase)) {
      return phrase
    }
  }
  return null
}

// Step 1: Category
export const categoryStepSchema = z.object({
  property_type: z.enum(['apartment', 'house', 'room', 'studio'], {
    message: 'Please select a property type',
  }),
})

// Step 2: Address
export const addressStepSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  district: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Step 3: Details
export const detailsStepSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters')
    .refine(
      (val) => !checkBlockedPhrases(val),
      {
        message: 'Title contains discriminatory language',
      }
    ),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .refine(
      (val) => !checkBlockedPhrases(val),
      {
        message: 'Description contains discriminatory language',
      }
    ),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  area_sqm: z.number().positive().min(5, 'Area must be at least 5 m²'),
  furnished: z.boolean(),
  expat_friendly: z.boolean(),
})

// Step 4: Media
export const mediaStepSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .max(40, 'Maximum 40 images allowed')
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      'Each image must be less than 5MB'
    )
    .refine(
      (files) =>
        files.every((file) =>
          ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
            file.type
          )
        ),
      'Only JPG, PNG, and WebP images are allowed'
    )
    .default([]),
  youtube_url: z
    .string()
    .url('Must be a valid YouTube URL')
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      'Must be a valid YouTube URL'
    )
    .optional()
    .or(z.literal('')),
})

// Step 5: Pricing
export const pricingStepSchema = z.object({
  price: z.number().positive('Price must be greater than 0'),
})

// Step 6: Availability
export const availabilityStepSchema = z.object({
  available_from: z.string().default(''),
})

// Complete listing schema
export const createListingSchema = categoryStepSchema
  .merge(addressStepSchema)
  .merge(detailsStepSchema)
  .merge(mediaStepSchema)
  .merge(pricingStepSchema)
  .merge(availabilityStepSchema)

export type CreateListingInput = z.infer<typeof createListingSchema>

// ============================================
// SEARCH VALIDATION
// ============================================

export const searchFiltersSchema = z.object({
  city: z.string().optional(),
  district: z.string().optional(),
  price_min: z.number().positive().optional(),
  price_max: z.number().positive().optional(),
  property_type: z.enum(['apartment', 'house', 'room', 'studio']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area_min: z.number().positive().optional(),
  area_max: z.number().positive().optional(),
  furnished: z.boolean().optional(),
  expat_friendly: z.boolean().optional(),
})

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>

// ============================================
// USER VALIDATION
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  // Add more profile fields as needed
})

// ============================================
// ADMIN VALIDATION
// ============================================

export const approveListingSchema = z.object({
  listingId: z.string().uuid(),
})

export const rejectListingSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
})

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['super_admin', 'moderator', 'owner', 'user']),
})

export const banUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(10, 'Ban reason must be at least 10 characters'),
})

// ============================================
// SAVED SEARCH VALIDATION
// ============================================

export const createSavedSearchSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  filters: searchFiltersSchema,
  notify_email: z.boolean().default(true),
})

export type CreateSavedSearchInput = z.infer<typeof createSavedSearchSchema>

// ============================================
// CONTACT FORM VALIDATION
// ============================================

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters').max(500),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
