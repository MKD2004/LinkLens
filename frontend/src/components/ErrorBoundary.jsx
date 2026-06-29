import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117] hero-grid px-4">
          <div className="text-center max-w-sm animate-fade-up">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)' }}
            >
              <svg className="w-7 h-7 text-[#F87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2
              className="text-2xl text-[#F0F6FF] mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
            >
              Something went wrong
            </h2>
            <p className="text-[#5A6E8F] text-sm mb-8">
              An unexpected error occurred. Refresh to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
