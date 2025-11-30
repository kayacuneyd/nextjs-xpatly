import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const user = data.user
      
      // Check if this is a password recovery flow (next points to reset-password)
      if (next.includes('/auth/reset-password')) {
        // User is in recovery mode, redirect to password update page
        return NextResponse.redirect(`${origin}/auth/reset-password?mode=update`)
      }
      
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!existingUser) {
        // Create user record for OAuth users
        await supabase.from('users').insert({
          id: user.id,
          email: user.email || '',
          role: 'user',
          user_type: 'tenant',
          is_verified: false,
          is_approved: false,
          is_banned: false,
        })
        // Redirect regular users to home
        return NextResponse.redirect(`${origin}/`)
      }
      
      // Redirect admins to admin dashboard
      if (existingUser.role === 'super_admin' || existingUser.role === 'moderator') {
        return NextResponse.redirect(`${origin}/admin`)
      }
      
      // Redirect to next URL or home
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(`${origin}/`)
}
