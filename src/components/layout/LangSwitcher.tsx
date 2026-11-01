import { Check, ChevronDown, Languages } from 'lucide-react'
import { useLanguage, type Lang } from '../../context/LanguageContext'

/**
 * The panel's language "select": a bold trigger pill + a styled option list.
 * Same look as mars-admin / mars-ceo / mars-mentor / mars-branch-manager.
 *
 * `native` is the language name written in that language itself (never
 * translated). `uz` / `ru` are the same name in the current UI language and
 * are shown as a secondary hint line.
 */
const OPTIONS: { code: Lang; native: string; uz: string; ru: string }[] = [
  { code: 'uz', native: "O'zbekcha", uz: "O'zbekcha", ru: 'Узбекский' },
  { code: 'ru', native: 'Русский', uz: 'Rus tili', ru: 'Русский' },
]

/** Emoji flags degrade to letters on Windows Chrome, so draw them with CSS. */
const FLAG_BG: Record<Lang, string> = {
  uz: 'linear-gradient(180deg, #0099b5 0 34%, #ffffff 34% 66%, #4caf50 66% 100%)',
  ru: 'linear-gradient(180deg, #ffffff 0 34%, #0039a6 34% 66%, #d52b1e 66% 100%)',
}

export function Flag({ code, className = 'lang-flag' }: { code: Lang; className?: string }) {
  return <span className={className} style={{ background: FLAG_BG[code] }} aria-hidden="true" />
}

export function LangSwitcher() {
  const { lang, setLang, tr } = useLanguage()
  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0]
  const label = tr('Til tanlash')

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" aria-label={label} aria-haspopup="listbox" className="lang-select lang-select--light">
        <Languages size={15} className="lang-select__icon" aria-hidden="true" />
        <Flag code={current.code} />
        <span className="lang-select__value">{current.code.toUpperCase()}</span>
        <ChevronDown size={16} className="lang-select__chev" aria-hidden="true" />
      </div>

      <ul tabIndex={0} role="listbox" aria-label={label} className="dropdown-content lang-menu mt-2">
        {OPTIONS.map((opt) => {
          const active = opt.code === lang
          const hint = opt[lang] !== opt.native ? opt[lang] : null
          return (
            <li key={opt.code} role="option" aria-selected={active}>
              <button
                type="button"
                className={`lang-option${active ? ' is-active' : ''}`}
                onClick={() => {
                  setLang(opt.code)
                  // The menu is focus-driven (like DaisyUI's dropdown) — blur the
                  // trigger so it closes after a pick.
                  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
                }}
              >
                <span className="lang-option__flag" aria-hidden="true"><Flag code={opt.code} /></span>
                <span className="lang-option__text">
                  <span className="lang-option__native">{opt.native}</span>
                  {hint ? <span className="lang-option__hint">{hint}</span> : null}
                </span>
                <span className="lang-option__check" aria-hidden="true">{active ? <Check size={16} strokeWidth={3} /> : null}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
