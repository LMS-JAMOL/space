import ruPhrases from '../locales/ru.phrases.json'

export type Lang = 'uz' | 'ru'

const RU = ruPhrases as Record<string, string>

export const LANG_STORAGE_KEY = 'mars-lang'

// Set synchronously by LanguageProvider on every render, so formatters outside
// React already use the new language in the render right after a switch.
let runtimeLang: Lang | null = null
export function setRuntimeLang(lang: Lang): void { runtimeLang = lang === 'ru' ? 'ru' : 'uz' }

/** Reads the saved language without React (services, formatters, module code). */
export function currentLanguage(): Lang {
  if (runtimeLang) return runtimeLang
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === 'ru' ? 'ru' : 'uz'
  } catch {
    return 'uz'
  }
}

/** Phrase lookup for non-component code. Missing phrases fall back to the Uzbek source. */
export function trNow(str: string): string {
  if (!str) return str
  return currentLanguage() === 'ru' ? (RU[str] ?? str) : str
}

export function localeNow(): string {
  return currentLanguage() === 'ru' ? 'ru-RU' : 'uz-UZ'
}
