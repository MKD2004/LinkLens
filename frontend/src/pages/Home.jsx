import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { isAuthenticated } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    let trimmedUrl = url.trim()
    if (!trimmedUrl) { setError('Please enter a URL'); return }
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      trimmedUrl = 'https://' + trimmedUrl
    }
    setLoading(true)
    try {
      const { data } = await api.post('/api/links', {
        url: trimmedUrl,
        ...(customAlias ? { customAlias: customAlias.trim() } : {}),
      })
      setResult(data)
    } catch (err) {
      const data = err.response?.data
      setError(data?.errors?.[0] || data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setUrl('')
    setCustomAlias('')
    setResult(null)
    setError('')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] py-10 relative">

      {/* Orange spotlight */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 42% at 50% 0%, rgba(255,107,43,0.1) 0%, transparent 65%)' }}
      />

      <div className="w-full max-w-[480px]">

        {/* Headline */}
        <div className="text-center mb-9 animate-fade-up">
          <h1
            className="text-[2.6rem] sm:text-5xl leading-[1.1] text-[#F0F6FF] mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-.03em' }}
          >
            Your links,<br />
            under a lens<span className="text-[#FF6B2B]">.</span>
          </h1>
          <p className="text-[#3A4E6A] text-base">
            Shorten, share, and watch clicks roll in—live.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 animate-fade-up-1"
          style={{ background: '#161D2E', border: '1px solid #243049' }}
        >
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="input-dark"
                type="text"
                placeholder="Paste a long URL..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                autoFocus
              />
              <div>
                <input
                  className="input-dark"
                  type="text"
                  placeholder="Custom alias (optional)"
                  value={customAlias}
                  onChange={e => setCustomAlias(e.target.value.slice(0, 30))}
                />
                {customAlias && (
                  <p className="text-xs text-[#2A3A52] text-right mt-1.5 font-mono">
                    {customAlias.length}/30
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
                  style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.18)' }}
                >
                  <svg className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-[#F87171] text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="btn-primary w-full py-3 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Shortening...
                  </>
                ) : 'Shorten →'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-slide-in">
              <div>
                <p className="text-[#2A3A52] text-xs uppercase tracking-widest font-medium mb-2.5">
                  Your short link
                </p>
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.18)' }}
                >
                  <span className="url-glow animate-glow-pulse flex-1 text-sm break-all min-w-0">
                    {result.shortUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="btn-primary shrink-0 px-3 py-1.5 text-xs rounded-lg"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <p
                className="text-xs text-[#2A3A52] break-all truncate"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                title={result.originalUrl}
              >
                {result.originalUrl}
              </p>

              <button onClick={handleReset} className="btn-ghost w-full py-2.5 text-sm">
                Shorten another
              </button>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <p className="text-center mt-5 text-sm text-[#2A3A52] animate-fade-up-2">
            <Link to="/login" className="text-[#FF6B2B] hover:text-[#FF9066] transition-colors">
              Sign in
            </Link>
            {' '}to track your links in real time
          </p>
        )}
      </div>
    </div>
  )
}
