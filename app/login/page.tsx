import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { LoginForm } from '@/components/forms/login-form'
import { getUser } from '@/lib/auth/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { redirectTo?: string }
}) {
  // If already logged in, redirect to home or redirectTo
  const user = await getUser()
  const locale = await getLocale()
  const redirectTo = searchParams?.redirectTo || `/${locale}`

  if (user) {
    redirect(redirectTo)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <LoginForm redirectTo={redirectTo} />
    </div>
  )
}
