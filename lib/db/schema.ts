import { relations } from 'drizzle-orm'
import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'moderator', 'owner', 'user'])
export const userTypeEnum = pgEnum('user_type', ['landlord', 'tenant', 'both'])
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'room', 'studio'])
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'pending', 'active', 'rejected', 'archived'])
export const notificationTypeEnum = pgEnum('notification_type', ['new_match', 'listing_approved', 'listing_rejected', 'admin_message'])
export const adminActionTypeEnum = pgEnum('admin_action_type', ['approve_listing', 'reject_listing', 'ban_user', 'verify_user', 'delete_listing', 'approve_user', 'reject_user'])
export const flaggedActionEnum = pgEnum('flagged_action', ['approved', 'rejected'])

// Users table (extends Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Links to auth.users
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('user'),
  userType: userTypeEnum('user_type').notNull().default('tenant'),
  isVerified: boolean('is_verified').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  isBanned: boolean('is_banned').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Listings table
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  district: text('district'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  propertyType: propertyTypeEnum('property_type').notNull(),
  bedrooms: integer('bedrooms').notNull().default(0),
  bathrooms: integer('bathrooms').notNull().default(0),
  areaSqm: decimal('area_sqm', { precision: 8, scale: 2 }).notNull(),
  furnished: boolean('furnished').notNull().default(false),
  expatFriendly: boolean('expat_friendly').notNull().default(false),
  youtubeUrl: text('youtube_url'),
  status: listingStatusEnum('status').notNull().default('pending'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Listing images table (1-40 images per listing)
export const listingImages = pgTable('listing_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  order: integer('order').notNull(), // 0-39
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Saved searches table
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  filters: text('filters').notNull(), // JSON string of SearchFilters
  notifyEmail: boolean('notify_email').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Flagged content table (Expat-Friendly Pledge enforcement)
export const flaggedContent = pgTable('flagged_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  flaggedText: text('flagged_text').notNull(),
  reviewed: boolean('reviewed').notNull().default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  actionTaken: flaggedActionEnum('action_taken'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Admin actions audit log
export const adminActions = pgTable('admin_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actionType: adminActionTypeEnum('action_type').notNull(),
  targetId: uuid('target_id').notNull(), // Can be listing_id, user_id, etc.
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  savedSearches: many(savedSearches),
  notifications: many(notifications),
  adminActions: many(adminActions),
}))

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  images: many(listingImages),
  notifications: many(notifications),
  flaggedContent: many(flaggedContent),
}))

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}))

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [notifications.listingId],
    references: [listings.id],
  }),
}))

export const flaggedContentRelations = relations(flaggedContent, ({ one }) => ({
  listing: one(listings, {
    fields: [flaggedContent.listingId],
    references: [listings.id],
  }),
  reviewer: one(users, {
    fields: [flaggedContent.reviewedBy],
    references: [users.id],
  }),
}))

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(users, {
    fields: [adminActions.adminId],
    references: [users.id],
  }),
}))
