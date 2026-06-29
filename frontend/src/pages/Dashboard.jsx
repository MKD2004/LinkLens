import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import LinkCard from '../components/LinkCard'
import { CardSkeleton } from '../components/LoadingSkeleton'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  async function fetchLinks() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/links?page=${page}&limit=10`)
      setLinks(data.links)
      setTotalPages(data.totalPages)
    } catch {
      setError('Failed to load links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLinks() }, [page])

  function handleToggle(shortId, isActive) {
    setLinks(prev => prev.map(l => l.shortId === shortId ? { ...l, isActive } : l))
  }

  function handleDelete(shortId) {
    setLinks(prev => prev.filter(l => l.shortId !== shortId))
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 animate-fade-up">
        <div>
          <h1
            className="text-2xl text-[#F0F6FF]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-.02em' }}
          >
            My Links
          </h1>
          {!loading && !error && (
            <p className="text-[#3A4E6A] text-sm mt-0.5">
              {links.length === 0 ? 'No links yet' : `Page ${page} of ${totalPages}`}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-primary w-full sm:w-auto px-4 py-2 text-sm"
        >
          + New link
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div
          className="rounded-xl p-10 text-center animate-fade-up"
          style={{ background: '#161D2E', border: '1px solid rgba(248,113,113,.15)' }}
        >
          <p className="text-[#F87171] text-sm mb-4">{error}</p>
          <button onClick={fetchLinks} className="btn-ghost px-4 py-2 text-sm">
            Retry
          </button>
        </div>
      ) : links.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center animate-fade-up"
          style={{ background: '#161D2E', border: '1px solid #243049' }}
        >
          <div
            className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,107,43,.08)', border: '1px solid rgba(255,107,43,.15)' }}
          >
            <svg className="w-6 h-6 text-[#FF6B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p
            className="text-[#F0F6FF] mb-1 text-base"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
          >
            No links yet
          </p>
          <p className="text-[#3A4E6A] text-sm mb-6">Shorten your first URL to get started.</p>
          <button onClick={() => navigate('/')} className="btn-primary px-5 py-2.5 text-sm">
            Create first link →
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {links.map((link, i) => (
              <div
                key={link.shortId}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <LinkCard
                  link={link}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 animate-fade-up">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="btn-ghost w-full sm:w-auto px-4 py-2 text-sm"
              >
                ← Previous
              </button>
              <span className="text-sm text-[#2A3A52] font-mono">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="btn-ghost w-full sm:w-auto px-4 py-2 text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
