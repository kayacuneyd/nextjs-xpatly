import { RegisterForm } from '@/components/forms/register-form'
import { getUser } from '@/lib/auth/actions'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  // If already logged in, redirect to home
  const user = await getUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <RegisterForm />
    </div>
  )
}
