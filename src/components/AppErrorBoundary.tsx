import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ServerErrorPage } from '../pages/ServerErrorPage'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Last line of defence: a render error anywhere below shows the 500 page
 * instead of unmounting React into a blank screen. The error is logged in
 * development only — never rendered.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('[ui] render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) return <ServerErrorPage />
    return this.props.children
  }
}
