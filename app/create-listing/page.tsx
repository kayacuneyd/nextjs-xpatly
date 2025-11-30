import { redirect } from 'next/navigation'

export default function CreateListingRedirectPage() {
  redirect('/listings/new')
}
