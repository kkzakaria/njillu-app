// Service pour les traductions selon DIP
import { ITranslationProvider } from '@/types/sidebar.types'

/**
 * Implémentation next-intl du fournisseur de traductions
 * DIP: Implémentation concrète de l'interface abstraite
 */
export class NextIntlTranslationProvider implements ITranslationProvider {
  private translations: Record<string, string>

  constructor(translations: Record<string, string>) {
    this.translations = translations
  }

  translate(key: string): string {
    const keys = key.split('.')
    let current: Record<string, unknown> | string = this.translations

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k] as Record<string, unknown> | string
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    return typeof current === 'string' ? current : key
  }
}

/**
 * Factory pour créer le provider de traductions
 * DIP: Factory pattern pour l'injection de dépendance
 */
export const createTranslationProvider = (
  translations: Record<string, string>
): ITranslationProvider => {
  return new NextIntlTranslationProvider(translations)
}