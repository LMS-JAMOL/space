import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import ruPhrases from '../locales/ru.phrases.json'
import { LANG_STORAGE_KEY, currentLanguage, setRuntimeLang, type Lang } from './languageRuntime'

export { trNow, localeNow, type Lang } from './languageRuntime'

const RU = ruPhrases as Record<string, string>

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** `tr('O‘quvchilar')` -> Russian when lang === 'ru', otherwise the Uzbek source. */
  tr: (str: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Development-only alarm for a missing translation. `tr()` always falls back to
 * the source string instead of throwing, so an untranslated phrase would
 * otherwise be invisible until someone who reads Russian opens the page.
 */
const warnMissing = (str: string) => {
  if (import.meta.env.DEV) console.warn(`[i18n] tr(${JSON.stringify(str)}) has no RU entry in src/locales/ru.phrases.json`)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLanguage)
  setRuntimeLang(lang)

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      /* storage may be blocked (private mode) — the choice then lasts for this visit only */
    }
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    setLang: (next) => { if (next === 'uz' || next === 'ru') setLangState(next) },
    tr: lang === 'ru'
      ? (str) => {
        if (!str) return str
        const hit = RU[str]
        if (hit === undefined) { warnMissing(str); return str }
        return hit
      }
      : (str) => str,
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
