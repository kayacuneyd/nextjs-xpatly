import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export async function requireAdmin() {
  const supabase = await createClient()

  // Always have a locale prefix to redirect with
  const locale = await getLocale().catch(() => 'en')
  const prefix = `/${locale || 'en'}`

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`${prefix}/login?redirectTo=${encodeURIComponent(`${prefix}/admin`)}`)
  }

  // Get user role from database
  const { data: fetchedUser, error } = await supabase
    .from('users')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()
  let userData = fetchedUser

  try {
    // If user doesn't exist in users table, create them
    if (error || !userData) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'user',
          is_verified: false,
          is_banned: false,
        })
        .select('role, is_banned')
        .single()

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError)
        redirect(`${prefix}/login?redirectTo=${encodeURIComponent(`${prefix}/admin`)}`)
      }

      userData = newUser
    }
  } catch (e) {
    console.error('Error ensuring user exists:', e)
    redirect(`${prefix}/login?redirectTo=${encodeURIComponent(`${prefix}/admin`)}`)
  }

  if (userData.is_banned) {
    redirect(`${prefix}/login?redirectTo=${encodeURIComponent(`${prefix}/admin`)}`)
  }

  // Check if user is admin or moderator
  if (userData.role !== 'super_admin' && userData.role !== 'moderator') {
    redirect(`${prefix}/login?redirectTo=${encodeURIComponent(`${prefix}/admin`)}`)
  }

  return {
    user,
    role: userData.role as 'super_admin' | 'moderator',
  }
}

export async function checkIsAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()

  if (!userData || userData.is_banned) {
    return false
  }

  return userData.role === 'super_admin' || userData.role === 'moderator'
}
