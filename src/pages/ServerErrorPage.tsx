import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { Button } from '../components/ui'
import { statusInfo } from '../lib/httpStatus'

/**
 * 500 page. Rendered by the app-level error boundary, so it must work without
 * the router: recovery is a reload, never a stack trace on screen.
 */
export function ServerErrorPage() {
  const { tr } = useLanguage()
  const info = statusInfo(500)
  return (
    <div role="alert" className="grid min-h-dvh place-items-center bg-canvas px-6 py-16 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>
        <p className="text-5xl font-black tabular-nums text-navy-900">500</p>
        <h1 className="mt-3 text-xl font-bold text-navy-900">{tr(info.title)}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{tr(info.message)}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={() => window.location.reload()}>{tr('Qayta urinish')}</Button>
          <Button variant="secondary" onClick={() => window.location.assign('/main-page')}>
            {tr('Asosiyga')}
          </Button>
        </div>
      </div>
    </div>
  )
}
