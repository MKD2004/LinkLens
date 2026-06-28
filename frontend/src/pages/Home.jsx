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
    if (!url) { setError('Please enter a URL'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/api/links', {
        url,
        ...(customAlias ? { customAlias } : {}),
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
    <div className="flex flex-col items-center py-8 sm:py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LinkLens</h1>
          <p className="text-gray-500">Shorten URLs and track clicks in real time</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Custom alias (optional)"
                value={customAlias}
                onChange={e => setCustomAlias(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Shortening...' : 'Shorten'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-medium">Your short link</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <span className="flex-1 text-indigo-600 font-medium text-sm break-all min-w-0">
                  {result.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-400 break-all">{result.originalUrl}</p>
              <button
                onClick={handleReset}
                className="w-full py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Shorten another
              </button>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <p className="text-center mt-4 text-sm text-gray-500">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Sign in to track your links
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
