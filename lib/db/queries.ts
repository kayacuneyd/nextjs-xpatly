import { db } from './index'
import {
  users,
  listings,
  listingImages,
  savedSearches,
  notifications,
  flaggedContent,
  adminActions
} from './schema'
import { eq, and, gte, lte, ilike, desc, asc, sql } from 'drizzle-orm'
import type { SearchFilters, ListingStatus, UserRole } from '@/types'

// ============================================
// USER QUERIES
// ============================================

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user
}

export async function updateUserRole(userId: string, role: UserRole) {
  const [user] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning()

  return user
}

export async function verifyUser(userId: string) {
  const [user] = await db
    .update(users)
    .set({ isVerified: true })
    .where(eq(users.id, userId))
    .returning()

  return user
}

export async function banUser(userId: string, adminId: string, reason?: string) {
  const [user] = await db
    .update(users)
    .set({ isBanned: true })
    .where(eq(users.id, userId))
    .returning()

  // Log admin action
  await db.insert(adminActions).values({
    adminId,
    actionType: 'ban_user',
    targetId: userId,
    reason,
  })

  return user
}

// ============================================
// LISTING QUERIES
// ============================================

export async function createListing(data: {
  userId: string
  title: string
  description: string
  address: string
  city: string
  district?: string
  latitude: string
  longitude: string
  price: string
  propertyType: 'apartment' | 'house' | 'room' | 'studio'
  bedrooms: number
  bathrooms: number
  areaSqm: string
  furnished: boolean
  expatFriendly: boolean
  youtubeUrl?: string
}) {
  const [listing] = await db
    .insert(listings)
    .values(data)
    .returning()

  return listing
}

export async function getListingById(listingId: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1)

  if (!listing) return null

  // Get images
  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(asc(listingImages.order))

  return { ...listing, images }
}

export async function getListingsByUserId(userId: string) {
  return await db
    .select()
    .from(listings)
    .where(eq(listings.userId, userId))
    .orderBy(desc(listings.createdAt))
}

export async function searchListings(filters: SearchFilters, page = 1, perPage = 20) {
  const query = db.select().from(listings)

  const conditions = [eq(listings.status, 'active')]

  if (filters.city) {
    conditions.push(ilike(listings.city, `%${filters.city}%`))
  }

  if (filters.district) {
    conditions.push(ilike(listings.district, `%${filters.district}%`))
  }

  if (filters.price_min !== undefined) {
    conditions.push(gte(listings.price, filters.price_min.toString()))
  }

  if (filters.price_max !== undefined) {
    conditions.push(lte(listings.price, filters.price_max.toString()))
  }

  if (filters.property_type) {
    conditions.push(eq(listings.propertyType, filters.property_type))
  }

  if (filters.bedrooms !== undefined) {
    conditions.push(gte(listings.bedrooms, filters.bedrooms))
  }

  if (filters.bathrooms !== undefined) {
    conditions.push(gte(listings.bathrooms, filters.bathrooms))
  }

  if (filters.area_min !== undefined) {
    conditions.push(gte(listings.areaSqm, filters.area_min.toString()))
  }

  if (filters.area_max !== undefined) {
    conditions.push(lte(listings.areaSqm, filters.area_max.toString()))
  }

  if (filters.furnished !== undefined) {
    conditions.push(eq(listings.furnished, filters.furnished))
  }

  if (filters.expat_friendly !== undefined) {
    conditions.push(eq(listings.expatFriendly, filters.expat_friendly))
  }

  const results = await query
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage)

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listings)
    .where(and(...conditions))

  return {
    data: results,
    total: Number(count),
    page,
    perPage,
    totalPages: Math.ceil(Number(count) / perPage),
  }
}

export async function updateListingStatus(
  listingId: string,
  status: ListingStatus,
  rejectionReason?: string
) {
  const [listing] = await db
    .update(listings)
    .set({ status, rejectionReason })
    .where(eq(listings.id, listingId))
    .returning()

  return listing
}

export async function deleteListing(listingId: string) {
  await db
    .delete(listings)
    .where(eq(listings.id, listingId))
}

// ============================================
// LISTING IMAGE QUERIES
// ============================================

export async function addListingImage(
  listingId: string,
  url: string,
  order: number
) {
  const [image] = await db
    .insert(listingImages)
    .values({ listingId, url, order })
    .returning()

  return image
}

export async function deleteListingImage(imageId: string) {
  await db
    .delete(listingImages)
    .where(eq(listingImages.id, imageId))
}

// ============================================
// SAVED SEARCH QUERIES
// ============================================

export async function createSavedSearch(
  userId: string,
  name: string,
  filters: SearchFilters,
  notifyEmail = true
) {
  const [savedSearch] = await db
    .insert(savedSearches)
    .values({
      userId,
      name,
      filters: JSON.stringify(filters),
      notifyEmail,
    })
    .returning()

  return savedSearch
}

export async function getSavedSearchesByUserId(userId: string) {
  return await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt))
}

export async function deleteSavedSearch(searchId: string) {
  await db
    .delete(savedSearches)
    .where(eq(savedSearches.id, searchId))
}

// ============================================
// NOTIFICATION QUERIES
// ============================================

export async function createNotification(data: {
  userId: string
  listingId?: string
  type: 'new_match' | 'listing_approved' | 'listing_rejected' | 'admin_message'
  title: string
  message: string
}) {
  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning()

  return notification
}

export async function getNotificationsByUserId(userId: string, unreadOnly = false) {
  const conditions = [eq(notifications.userId, userId)]

  if (unreadOnly) {
    conditions.push(eq(notifications.read, false))
  }

  return await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
}

export async function markNotificationAsRead(notificationId: string) {
  const [notification] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId))
    .returning()

  return notification
}

// ============================================
// FLAGGED CONTENT QUERIES
// ============================================

export async function createFlaggedContent(data: {
  listingId: string
  reason: string
  flaggedText: string
}) {
  const [flagged] = await db
    .insert(flaggedContent)
    .values(data)
    .returning()

  return flagged
}

export async function getUnreviewedFlaggedContent() {
  return await db
    .select()
    .from(flaggedContent)
    .where(eq(flaggedContent.reviewed, false))
    .orderBy(desc(flaggedContent.createdAt))
}

export async function reviewFlaggedContent(
  flaggedId: string,
  reviewerId: string,
  action: 'approved' | 'rejected'
) {
  const [flagged] = await db
    .update(flaggedContent)
    .set({
      reviewed: true,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      actionTaken: action,
    })
    .where(eq(flaggedContent.id, flaggedId))
    .returning()

  return flagged
}

// ============================================
// ADMIN ACTION QUERIES
// ============================================

export async function logAdminAction(data: {
  adminId: string
  actionType: 'approve_listing' | 'reject_listing' | 'ban_user' | 'verify_user' | 'delete_listing'
  targetId: string
  reason?: string
}) {
  const [action] = await db
    .insert(adminActions)
    .values(data)
    .returning()

  return action
}

export async function getAdminActions(limit = 50) {
  return await db
    .select()
    .from(adminActions)
    .orderBy(desc(adminActions.createdAt))
    .limit(limit)
}

// ============================================
// DUPLICATE DETECTION
// ============================================

export async function checkDuplicateListing(
  address: string,
  userId: string
): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.address, address),
        eq(listings.userId, userId)
      )
    )
    .limit(1)

  return !!existing
}
