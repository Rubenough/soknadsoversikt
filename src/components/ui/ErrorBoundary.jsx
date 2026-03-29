import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Log for debugging — never expose to users in production
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset() {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
          <span className="text-4xl block mb-4" aria-hidden="true">⚠️</span>
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">Noe gikk galt</h1>
          <p className="text-sm text-[#475569] mb-6 leading-relaxed">
            En uventet feil oppsto. Prøv å laste siden på nytt — lagrede søknader påvirkes ikke.
          </p>

          {/* Show error details only in development */}
          {import.meta.env.DEV && (
            <pre className="text-left text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 mb-6 overflow-auto max-h-40 text-[#DC2626]">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Last inn på nytt
            </button>
            <button
              onClick={() => this.reset()}
              className="h-10 px-5 border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold text-sm rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#2563EB] focus-visible:outline-offset-2"
            >
              Prøv igjen
            </button>
          </div>
        </div>
      </div>
    )
  }
}
