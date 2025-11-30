// Can be imported from a shared config
export const locales = ['en', 'et', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'
export const localePrefix = 'always'

import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  et: 'Eesti',
  ru: 'Русский',
}

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  const messages = await (async () => {
    switch (locale) {
      case 'en':
        return (await import('./messages/en.json')).default
      case 'et':
        return (await import('./messages/et.json')).default
      case 'ru':
        return (await import('./messages/ru.json')).default
      default:
        return (await import('./messages/en.json')).default
    }
  })()

  return { messages, locale }
})
