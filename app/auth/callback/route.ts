import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (user) {
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
    }
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(`${origin}/`)
}
