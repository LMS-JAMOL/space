import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import MarsLogo from '../../components/ui/MarsLogo'
import { errorMessage, TOKEN_KEY } from '../../services/apiClient'
import { authService } from '../../services/authService'

const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY))

/** `+998 90 123 45 67` → `+998901112233` (the format the API validates). */
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '')

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
)

/**
 * Mars Space kirish sahifasi — `POST /api/v1/auth/login`.
 *
 * Ko'rinishi xodimlar panellari (mars-admin, mars-ceo, …) bilan BIR XIL:
 * `auth-screen` + Mars sayyorasi + `auth-card` + MARS wordmark + sariq
 * «Kirish» tugmasi. Farq — faqat sarlavha va rol yorlig'i.
 *
 * One field takes either a phone or an email: the value is routed to the
 * matching request key, because the backend rejects an email sent as `phone`.
 * On success the access token is stored under the key `apiClient` reads, then
 * the app refetches `/auth/me` and lands on the dashboard.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const login = useMutation({
    mutationFn: () => {
      const value = identifier.trim()
      const isEmail = value.includes('@')
      return authService.login(
        isEmail ? { email: value, password } : { phone: normalizePhone(value), password },
      )
    },
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      qc.invalidateQueries({ queryKey: ['me'] })
      navigate('/main-page', { replace: true })
    },
  })

  // Already signed in — no reason to show the form.
  if (hasToken() && !login.isError) return <Navigate to="/main-page" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) return
    login.mutate()
  }

  return (
    <main className="auth-screen">
      {/* 1:1 Mars Planet from core.marsit.uz */}
      <div className="auth-planet" aria-hidden="true" />

      {/* 1:1 Orbit with glowing dot from core.marsit.uz */}
      <div className="auth-orbit" aria-hidden="true">
        <span className="auth-orbit__dot" />
      </div>

      <section className="auth-card" aria-labelledby="auth-title">
        <header className="text-center">
          <div className="flex items-center justify-center">
            <MarsLogo variant="navy" className="h-[38px]" />
          </div>

          <h1 id="auth-title" className="mt-4 text-[22px] font-bold tracking-tight text-[#0D0D5B]">
            Talaba paneli uchun kirish
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Mars Space — o‘quvchi kabineti
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#f44516]/20 bg-[#f44516]/10 px-3.5 py-1 text-xs font-semibold text-[#f44516]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#f44516]" />
            Student panel
          </div>
        </header>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="login-phone" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Telefon raqam
            </label>
            <input
              id="login-phone"
              type="text"
              placeholder="+998 90 123 45 67"
              autoComplete="tel"
              className="auth-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Parol
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Parol"
                autoComplete="current-password"
                className={`auth-input pr-10${login.isError ? ' has-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {login.isError && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600"
            >
              {errorMessage(login.error)}
            </div>
          )}

          <button type="submit" className="auth-btn-submit mt-2" disabled={login.isPending || !identifier.trim() || !password}>
            {login.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Kirilmoqda…
              </span>
            ) : (
              <span>Kirish</span>
            )}
          </button>
        </form>
      </section>
    </main>
  )
}
