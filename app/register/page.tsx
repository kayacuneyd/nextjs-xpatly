import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { RegisterForm } from '@/components/forms/register-form'
import { getUser } from '@/lib/auth/actions'

export default async function RegisterPage() {
  // If already logged in, redirect to home
  const user = await getUser()
  const locale = await getLocale()
  if (user) {
    redirect(`/${locale}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <RegisterForm />
    </div>
  )
}
