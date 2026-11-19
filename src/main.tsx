import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </LanguageProvider>
  </StrictMode>,
)
