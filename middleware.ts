import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, locales } from './i18n'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API/static routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/auth') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const maybeLocale = segments[0]
  const isLocale = locales.includes(maybeLocale as (typeof locales)[number])

  // No locale: redirect to default locale prefix
  if (!isLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // Update Supabase session - this returns a response with updated cookies
  const supabaseResponse = await updateSession(request)
  
  // Set locale cookie on the supabase response
  if (supabaseResponse) {
    supabaseResponse.cookies.set('NEXT_LOCALE', maybeLocale, { path: '/' })
    return supabaseResponse
  }

  // Fallback
  const response = NextResponse.next()
  response.cookies.set('NEXT_LOCALE', maybeLocale, { path: '/' })
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
