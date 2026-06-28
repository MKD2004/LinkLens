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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Shorten New Link
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchLinks}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No links yet. Shorten your first URL.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get started
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {links.map(link => (
              <LinkCard
                key={link.shortId}
                link={link}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
