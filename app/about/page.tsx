import { defaultLocale } from '@/i18n'
import { redirect } from 'next/navigation'

export default function AboutPage() {
  redirect(`/${defaultLocale}/about`)
}
