import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/en/login?redirectTo=/admin')
  }

  // Use admin client to bypass RLS and get user role
  const { data: fetchedUser, error } = await adminSupabase
    .from('users')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()
  let userData = fetchedUser

  try {
    // If user doesn't exist in users table, create them
    if (error || !userData) {
      const { data: newUser, error: insertError } = await adminSupabase
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
        redirect('/en/login?redirectTo=/admin')
      }

      userData = newUser
    }
  } catch (e) {
    console.error('Error ensuring user exists:', e)
    redirect('/en/login?redirectTo=/admin')
  }

  if (userData.is_banned) {
    redirect('/en/login?redirectTo=/admin')
  }

  // Check if user is admin or moderator
  if (userData.role !== 'super_admin' && userData.role !== 'moderator') {
    redirect('/en')
  }

  return {
    user,
    role: userData.role as 'super_admin' | 'moderator',
  }
}

export async function checkIsAdmin() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Use admin client to bypass RLS
  const { data: userData } = await adminSupabase
    .from('users')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()

  if (!userData || userData.is_banned) {
    return false
  }

  return userData.role === 'super_admin' || userData.role === 'moderator'
}
