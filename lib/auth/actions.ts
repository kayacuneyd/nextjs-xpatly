'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserType } from '@/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure user exists in users table and get their role
  let userRole = 'user'
  if (data.user) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', data.user.id)
      .single()

    if (!existingUser) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email || '',
        role: 'user',
        user_type: 'tenant',
        is_verified: false,
        is_approved: false,
        is_banned: false,
      })
    } else {
      userRole = existingUser.role
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, user: data.user, role: userRole }
}

export async function signUp(email: string, password: string, userType: UserType = 'tenant') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create user in users table with user type
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email || '',
      role: 'user',
      user_type: userType,
      is_verified: false,
      is_approved: false,
      is_banned: false,
    })
  }

  // Check if email confirmation is required
  // If user.identities is empty, it means the user already exists
  // If email_confirmed_at is null and identities exist, email confirmation is required
  const requiresEmailConfirmation = data.user?.identities?.length === 0 
    ? false 
    : !data.user?.email_confirmed_at

  return {
    success: true,
    user: data.user,
    requiresEmailConfirmation,
    message: requiresEmailConfirmation 
      ? 'Please check your email to verify your account'
      : 'Account created successfully!'
  }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/en/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function getUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: 'Check your email for the password reset link'
  }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password updated successfully' }
}
