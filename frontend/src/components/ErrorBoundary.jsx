import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F5] hero-grid px-4">
          <div className="text-center max-w-sm animate-fade-up">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.15)' }}
            >
              <svg className="w-7 h-7 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2
              className="text-2xl text-[#1A1A14] mb-2"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              Something went wrong
            </h2>
            <p className="text-[#6B6B5E] text-sm mb-8">
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
