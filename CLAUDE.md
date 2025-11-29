# Xpatly - Expat-Friendly Real Estate Platform

## Project Overview
Xpatly is a real estate listing platform specifically designed for expats in Estonia. The platform combats housing discrimination by implementing an "Expat-Friendly Pledge" system and automated content moderation.

## Tech Stack

### Frontend & Backend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + shadcn/ui patterns
- **State Management**: React Context + Server Components

### Database & Backend Services
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### Third-Party Integrations
- **Maps**: Mapbox GL JS (`mapbox-gl`, `react-map-gl`)
- **Email**: Resend + React Email
- **i18n**: next-intl (Estonian, English, Russian)
- **Forms**: React Hook Form + Zod validation

### Hosting & Deployment
- **Frontend**: Vercel (Free tier initially)
- **Database**: Supabase (Free tier: 500MB DB + 1GB storage)
- **CDN**: Cloudflare (Free tier)
- **Email**: Resend (Free tier: 3,000 emails/month)

## Core Features

### 1. Expat-Friendly Pledge System
- Landlords can mark listings as "expat-friendly"
- Automated detection of discriminatory phrases
- Blocked phrases include: "locals only", "no foreigners", "eestlastele", "ainult kohalikud"
- Admin review for flagged content

### 2. Multi-Language Support (i18n)
- **Languages**: Estonian (et), English (en), Russian (ru)
- **Default**: English
- **Implementation**: next-intl with URL-based locale routing (`/en`, `/et`, `/ru`)
- **Translation files**: `messages/en.json`, `messages/et.json`, `messages/ru.json`

### 3. Listing Management
- **Image Upload**: Minimum 1, maximum 40 images per listing
- **Duplicate Detection**: Check for duplicate addresses, images, and titles
- **Multi-step Form**: Category → Address → Details → Media → Pricing → Availability → Preview → Publish
- **Map Integration**: Mapbox for location selection and display
- **YouTube Integration**: Optional YouTube video links

### 4. User Roles & Permissions
- **Super Admin**: Full access to all features, user management, moderation
- **Moderator**: Can review and approve/reject listings, manage flagged content
- **Property Owner**: Can create, edit, and manage their own listings
- **Regular User**: Can browse, save searches, and contact property owners

### 5. Search & Filtering
- **Filters**: Location (city, district), price range, property type, number of rooms, size (m²), furnished/unfurnished
- **Map-based Search**: Search by drawing on map or clicking location
- **Saved Searches**: Users can save search criteria and receive notifications
- **Smart Matching**: Email notifications when new listings match saved searches

### 6. Admin Panel
- Listing approval/rejection workflow
- User management (roles, bans, verification)
- Content moderation (flagged listings)
- Analytics dashboard (listings, users, searches)
- Bulk operations (approve/reject multiple listings)

## Database Schema

### Core Tables
- `users` - User accounts with role-based permissions
- `listings` - Property listings with all details
- `listing_images` - Images associated with listings (1-40 per listing)
- `saved_searches` - User's saved search criteria
- `notifications` - Email notifications queue
- `flagged_content` - Auto-flagged listings with discriminatory content
- `admin_actions` - Audit log for admin activities

### Key Fields
**listings table:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `title` (text)
- `description` (text)
- `address` (text)
- `city` (text)
- `district` (text)
- `latitude` (decimal)
- `longitude` (decimal)
- `price` (decimal)
- `property_type` (enum: apartment, house, room, studio)
- `bedrooms` (integer)
- `bathrooms` (integer)
- `area_sqm` (decimal)
- `furnished` (boolean)
- `expat_friendly` (boolean)
- `youtube_url` (text, nullable)
- `status` (enum: draft, pending, active, rejected, archived)
- `rejection_reason` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**users table:**
- `id` (UUID, primary key, from Supabase Auth)
- `email` (text, unique)
- `role` (enum: super_admin, moderator, owner, user)
- `is_verified` (boolean)
- `is_banned` (boolean)
- `created_at` (timestamp)

## Coding Standards

### TypeScript
- Always use TypeScript strict mode
- Define types in `types/` directory
- Use interfaces for object shapes
- Use type aliases for unions/primitives
- No `any` types unless absolutely necessary

### React Components
- Use Server Components by default
- Add `"use client"` directive only when needed (client-side interactivity, hooks, browser APIs)
- File naming: PascalCase for components (e.g., `ListingCard.tsx`)
- One component per file

### File Organization
```
app/
  [locale]/          # i18n routing
    layout.tsx       # Root layout
    page.tsx         # Home page
    listings/        # Listings routes
    admin/           # Admin routes
  api/               # API routes
components/
  ui/                # Reusable UI components
  forms/             # Form components
  listings/          # Listing-specific components
  admin/             # Admin-specific components
lib/
  db/
    schema.ts        # Drizzle schema
    queries.ts       # Database queries
    migrations/      # Database migrations
  email/
    templates/       # React Email templates
  utils/
    validation.ts    # Zod schemas
    helpers.ts       # Utility functions
  supabase/
    client.ts        # Supabase client
    server.ts        # Supabase server client
types/
  index.ts           # Shared TypeScript types
messages/
  en.json            # English translations
  et.json            # Estonian translations
  ru.json            # Russian translations
```

### Database Queries
- All database queries in `lib/db/queries.ts`
- Use Drizzle ORM for type-safe queries
- Implement Supabase Row Level Security (RLS) policies
- Never expose service role key on client side

### Forms
- Use React Hook Form for all forms
- Validate with Zod schemas
- Define schemas in `lib/utils/validation.ts`
- Show user-friendly error messages

### Security
- Implement RLS policies for all tables
- Validate all user input (server-side)
- Sanitize user-generated content
- Use prepared statements (Drizzle handles this)
- Never trust client-side data

### Error Handling
- Use try-catch for async operations
- Log errors with context
- Show user-friendly error messages
- Don't expose sensitive error details to users

## Testing Strategy

### Unit Tests
- Utility functions (`lib/utils/`)
- Validation schemas
- Helper functions

### Integration Tests
- API routes
- Database queries
- Email sending

### E2E Tests (Critical Flows)
- User registration & login
- Listing creation flow
- Search & filtering
- Admin approval workflow

## Git Workflow

### Branch Strategy
- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/[feature-name]` - Feature branches
- `fix/[bug-name]` - Bug fix branches

### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Pull Requests
- Always create PR before merging to main
- Require at least 1 review
- Run tests before merging
- Update CHANGELOG.md

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox API token
- `RESEND_API_KEY` - Resend API key for emails
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_DEFAULT_LOCALE` - Default language (en)
- `ADMIN_EMAIL` - Super admin email

## Deployment Checklist

### Initial Setup
- [ ] Create Supabase project
- [ ] Set up database schema and RLS policies
- [ ] Create storage buckets (listings, avatars)
- [ ] Configure Supabase Auth providers
- [ ] Get Mapbox API token
- [ ] Get Resend API key
- [ ] Configure domain on Vercel

### Pre-deployment
- [ ] Run type checking: `npm run build`
- [ ] Test all critical flows
- [ ] Set environment variables on Vercel
- [ ] Configure custom domain
- [ ] Set up Vercel Analytics

### Post-deployment
- [ ] Verify email sending works
- [ ] Test image uploads
- [ ] Test authentication flow
- [ ] Monitor error logs
- [ ] Set up backup strategy

## Performance Optimization

### Images
- Use Next.js Image component for automatic optimization
- Compress images before upload (client-side)
- Convert to WebP format
- Lazy load images below the fold

### Database
- Add indexes on frequently queried columns
- Use database connection pooling
- Implement pagination for large result sets
- Cache frequently accessed data

### Caching
- Use Next.js ISR (Incremental Static Regeneration) for public pages
- Cache API responses with appropriate TTL
- Use Supabase real-time subscriptions for live updates

## Key Constraints & Business Rules

### Listing Creation
- Minimum 1 image required
- Maximum 40 images allowed
- Image file size limit: 5MB per image
- Supported formats: JPG, PNG, WebP
- Duplicate detection runs before publish
- All listings start in "pending" status (except for verified users)

### Expat-Friendly Pledge
- Automated screening on submit
- Flagged content goes to admin review
- Blocked phrases are configurable in admin panel
- False positives can be appealed

### User Verification
- Email verification required to create listings
- Phone verification optional (future feature)
- Verified users get instant listing approval
- New users have moderation queue

### Admin Moderation
- Super admins can override all decisions
- Moderators can approve/reject listings
- Rejection requires reason (shown to user)
- Users can edit and resubmit rejected listings

## Future Enhancements (Post-MVP)

- SMS notifications via Twilio
- WhatsApp integration for contact
- AI-powered description suggestions
- Virtual tours (360° photos)
- Rental agreement templates
- Tenant screening integration
- Payment processing for featured listings
- Mobile app (React Native)
- Landlord verification badges
- Review system for properties

## Support & Documentation

- **Project Documentation**: This file (CLAUDE.md)
- **API Documentation**: (To be added)
- **User Guide**: (To be added in `/docs`)
- **Admin Guide**: (To be added in `/docs`)

---

**Last Updated**: 2025-01-29
**Project Status**: Initial Setup Phase
**Current Version**: 0.1.0
