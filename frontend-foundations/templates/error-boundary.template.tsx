/**
 * Template — Error Boundary (src/components/ErrorBoundary.tsx)
 *
 * Uso em App.tsx:
 *   <ErrorBoundary>
 *     <main>...</main>
 *   </ErrorBoundary>
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type State = { hasError: boolean; error?: Error }
type Props = {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info)
    }
    // TODO(author): reportar para serviço de error tracking (Sentry, etc)
  }

  reset = () => this.setState({ hasError: false, error: undefined })

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset)

      return (
        <div role="alert" className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Algo deu errado</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {import.meta.env.DEV ? this.state.error.message : 'Tente recarregar a página.'}
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </div>
      )
    }
    return this.props.children
  }
}
