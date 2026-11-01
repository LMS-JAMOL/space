#!/usr/bin/env node
/**
 * i18n-check — keeps the two-layer translation setup honest.
 *
 *   Layer 1  t('nav.students')  -> src/locales/uz.json / ru.json   (nested keys)
 *   Layer 2  tr('O‘quvchilar')  -> src/locales/ru.phrases.json      (phrase dict)
 *
 * `tr()` falls back to the Uzbek source string when the Russian phrase is
 * missing, so a forgotten entry never crashes — it silently ships Uzbek inside
 * a Russian UI. That is exactly the failure this script turns into an error.
 *
 * It reports three things:
 *
 *   ERROR  tr('...')  with no entry in ru.phrases.json      -> exit 1
 *   ERROR  t('a.b')   missing from uz.json or ru.json       -> exit 1
 *   WARN   user-visible text in JSX that is NOT wrapped     -> exit 0
 *          in tr()/t() at all (only `--strict` makes this fatal)
 *
 * Usage:
 *   npm run i18n:check              # errors fail, warnings print
 *   npm run i18n:check -- --strict  # warnings fail too
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const localesDir = path.join(srcDir, 'locales')
const strict = process.argv.includes('--strict')

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const ruPhrases = readJson(path.join(localesDir, 'ru.phrases.json'))
const uzDict = readJson(path.join(localesDir, 'uz.json'))
const ruDict = readJson(path.join(localesDir, 'ru.json'))

/** Every .js/.jsx source file, minus tests and the locale JSON themselves. */
const files = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(jsx?|tsx?)$/.test(entry.name) && !/\.test\.[jt]sx?$/.test(entry.name)) {
      files.push(full)
    }
  }
}
walk(srcDir)

const unescape = (s) => s.replace(/\\(['"\\])/g, '$1')

/** All `tr('literal')` / `trNow("literal")` arguments in a source string. */
const trLiterals = (code) => {
  const out = []
  for (const re of [/\btr(?:Now)?\(\s*'((?:[^'\\]|\\.)*)'/g, /\btr(?:Now)?\(\s*"((?:[^"\\]|\\.)*)"/g]) {
    let m
    while ((m = re.exec(code))) out.push(unescape(m[1]))
  }
  return out
}

/** All `t('some.key')` arguments (a dotted key only). */
const tKeys = (code) => {
  const out = []
  for (const re of [/(?<![.\w$])t\(\s*'([A-Za-z0-9_][\w.-]*)'/g, /(?<![.\w$])t\(\s*"([A-Za-z0-9_][\w.-]*)"/g]) {
    let m
    while ((m = re.exec(code))) out.push(m[1])
  }
  return out
}

const hasKey = (dict, key) =>
  key
    .split('.')
    .every((part) => {
      if (dict && typeof dict === 'object' && part in dict) {
        dict = dict[part]
        return true
      }
      return false
    })

/**
 * User-visible text that never went through tr()/t().
 *
 * Two shapes: JSX text nodes (`>Sahifa<`) and plain-string attributes
 * (title / placeholder / aria-label / label / alt). Everything already inside
 * a tr()/t() call is blanked out first so it is not reported twice.
 */
const ATTRS = /\b(title|placeholder|aria-label|aria-description|label|alt|header|emptyText)\s*=\s*("([^"]*)"|'([^']*)')/g
// `>` ... `<` with no braces/tags in between. Newlines are allowed on purpose:
// a paragraph split across lines is still one untranslated string.
const JSX_TEXT = />([^<>{}]+)</g

/** Words that are identical in Uzbek and Russian (or are brand/technical). */
const NEVER_TRANSLATE = new Set([
  'Mars', 'CEO', 'ID', 'Email', 'SMS', 'API', 'PDF', 'CSV', 'XLSX', 'URL', 'PIN',
  'Admin', 'Login', 'Dashboard', 'Coin', 'Mentor', 'Mars ID', 'OK', 'Dev', 'Test',
  'Avatar', 'MARS LMS · v1.0',
])

/** Characters that mean "this is JavaScript, not copy" inside a match. */
const CODE_CHARS = /[&|=<>()\[\]{};+*/%!?\^~`]/

const looksLikeText = (raw) => {
  const s = raw.trim()
  if (s.length < 2) return false
  if (!/[A-Za-z\u0100-\u024F\u2018\u2019]/.test(s)) return false
  if (!/[A-Za-z\u0100-\u024F]{2,}/.test(s)) return false
  if (NEVER_TRANSLATE.has(s)) return false
  // JavaScript leaking through the `> ... <` slice (comparisons, calls, JSX
  // expressions) is not user-visible copy.
  if (CODE_CHARS.test(s)) return false
  // placeholders / format samples, not copy
  if (/^[+\d\s().\-*•#]+$/.test(s)) return false
  if (/^[\w.\-]+@[\w.\-]+$/.test(s)) return false
  if (/^(https?:|\/|#[\w-]+$|\d+%$)/.test(s)) return false
  return true
}

/** Blank out comments while keeping every newline, so line numbers stay true. */
const stripComments = (code) =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (s) => s.replace(/[^\n]/g, ' '))

const stripWrapped = (code) =>
  code
    // Blank the phrase but keep its exact length and newlines, so line numbers
    // reported later still point at the real source line.
    .replace(/\btr(?:Now)?\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g, (m, quote, inner) =>
      `tr(${quote}${inner.replace(/[^\n]/g, ' ')}${quote})`,
    )
    .replace(/(?<![.\w$])t\(\s*(['"])[\w.-]*\1/g, 't()')

/**
 * Detector 3 — Uzbek-looking string literals anywhere.
 *
 * Catches the shapes the other two miss: `{ok ? 'Hammasi joyida' : 'Davom eting'}`
 * or `toast.success('Xush kelibsiz!')`. Two signals, both high precision for a
 * project whose Russian copy is always Cyrillic:
 *   • ‘ ’ ʻ — Uzbek orthography, never used in Russian
 *   • words that have no Russian cognate in Latin script
 */
const UZ_WORDS =
  /\b(uchun|sahifa|guruhlar|guruh|foydalanuvchi|mavjud|topilmadi|yuklanmoqda|yuklan|qidiruv|filial|jadval|murojaat|hisoblanadi|belgilanmagan|kiriting|tanlang|saqlang|barcha|hammasi|menyu|havola|xatolik|davom eting|qayta urin|tokshir|ko'rish|ko‘rish|o'quvchi|o‘quvchi|parolni|kirish|staj|qoldiq|to'lov|to‘lov|hisobot|so'rov|so‘rov|nazorat|bildirish|yozilgan|kiritilmagan)\b/i
const STRING_LITERAL = /(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g

const looksUzbek = (value) => {
  if (!value || !/[A-Za-z\u0100-\u024F]/.test(value)) return false // not Latin
  if (/[\u0400-\u04FF]/.test(value)) return false // already Cyrillic
  if (!/[\u2018\u2019\u02BB]/.test(value) && !UZ_WORDS.test(value)) return false
  return true
}

const errors = []
const reportedError = new Set()
const fail = (text) => {
  if (reportedError.has(text)) return
  reportedError.add(text)
  errors.push(text)
}
const warnings = []
const seenWarning = new Set()
const warn = (text) => {
  if (seenWarning.has(text)) return
  seenWarning.add(text)
  warnings.push(text)
}
const trSeen = new Set()
const keySeen = new Set()

for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join('/')
  const code = fs.readFileSync(file, 'utf8')
  const lineOf = (index) => code.slice(0, index).split('\n').length

  for (const phrase of trLiterals(code)) {
    trSeen.add(phrase)
    if (!(phrase in ruPhrases)) {
      fail(`${rel}  tr('${phrase}')  ->  no RU entry in src/locales/ru.phrases.json`)
    }
  }

  for (const key of tKeys(code)) {
    keySeen.add(key)
    if (!hasKey(uzDict, key)) fail(`${rel}  t('${key}')  ->  missing in src/locales/uz.json`)
    if (!hasKey(ruDict, key)) fail(`${rel}  t('${key}')  ->  missing in src/locales/ru.json`)
  }

  const body = stripComments(stripWrapped(code))
  let m
  ATTRS.lastIndex = 0
  while ((m = ATTRS.exec(body))) {
    const value = m[3] ?? m[4] ?? ''
    // `foo >="bar"` style comparisons are not an attribute value we care about.
    const before = body[m.index - 1] ?? ''
    if (looksLikeText(value) && !'=!<>+-*/&|?:,('.includes(before)) {
      warn(`${rel}:${lineOf(m.index)}  ${m[1]}="${value}"  ->  not wrapped in tr()/t()`)
    }
  }
  JSX_TEXT.lastIndex = 0
  while ((m = JSX_TEXT.exec(body))) {
    const value = m[1].replace(/\s+/g, ' ').trim()
    if (!looksLikeText(value)) continue
    // A real JSX text node is opened by a tag `>` or a `}` expression end,
    // never by a comparison operator such as `a >= b`.
    const before = body[m.index - 1] ?? ''
    if (!'=!<>+-*/&|?:,(~'.includes(before)) {
      warn(`${rel}:${lineOf(m.index)}  >${value}<  ->  not wrapped in tr()/t()`)
    }
  }

  STRING_LITERAL.lastIndex = 0
  const hasOwnLanguageMap = /\b(?:const|let|var)\s+translations\s*=\s*\{/.test(code)
  while ((m = STRING_LITERAL.exec(body))) {
    const value = m[2]
    // Already in the phrase dictionary: it is translated wherever it finally
    // passes through tr(). Files that carry their own `uz`/`ru` map are their
    // own second language layer, so they are not this detector's business.
    if (ruPhrases[value] !== undefined) continue
    if (hasOwnLanguageMap) continue
    if (looksUzbek(value)) {
      warn(`${rel}:${lineOf(m.index)}  '${value}'  ->  Uzbek literal, never reaches ru.phrases.json`)
    }
  }
}

const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length))
console.log(pad('i18n-check', 14), `files ${files.length} | tr() ${trSeen.size} | t() ${keySeen.size} | ru phrases ${Object.keys(ruPhrases).length}`)

if (errors.length) {
  console.log(`\n\x1b[31mERRORS (${errors.length})\x1b[0m — these WILL show Uzbek in a Russian UI:`)
  for (const e of errors) console.log('  \x1b[31m•\x1b[0m ' + e)
}

if (warnings.length) {
  const head = `\x1b[33mWARNINGS (${warnings.length})\x1b[0m — raw text, will NOT translate:`
  console.log(strict ? `\n${head}` : `\n${head} (informational, use --strict to fail)`)
  for (const w of warnings) console.log('  \x1b[33m•\x1b[0m ' + w)
}

if (!errors.length && !warnings.length) console.log('\n\x1b[32m✔ every user-visible string goes through t()/tr() and has a Russian translation.\x1b[0m')
else if (!errors.length) console.log('\n\x1b[32m✔ no missing translations.\x1b[0m')

if (errors.length || (strict && warnings.length)) process.exit(1)
