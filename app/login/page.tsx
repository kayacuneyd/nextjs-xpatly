import { LoginForm } from '@/components/forms/login-form'
import { getUser } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirectTo?: string }>
}) {
  // If already logged in, check role and redirect appropriately
  const user = await getUser()
  const params = await searchParams
  const redirectTo = params?.redirectTo

  if (user) {
    // Check if user is admin
    const supabase = await createClient()
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Admin users always go to admin dashboard
    if (userData?.role === 'super_admin' || userData?.role === 'moderator') {
      redirect('/admin')
    }

    // Regular users go to their intended destination or home
    redirect(redirectTo || '/en')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <LoginForm redirectTo={redirectTo || '/en'} />
    </div>
  )
}
