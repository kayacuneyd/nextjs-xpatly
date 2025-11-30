import { CreateListingForm } from '@/components/listings/CreateListingForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function NewListingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/listings/new')
  }

  // Check if user is admin - admins should not create listings
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role === 'super_admin' || userData?.role === 'moderator') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create New Listing</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to create your property listing
          </p>
        </div>
        <CreateListingForm />
      </div>
    </div>
  )
}
