import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import LinkCard from '../components/LinkCard'

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-md w-12" />
          <div className="h-6 bg-gray-200 rounded-md w-20" />
          <div className="h-6 bg-gray-200 rounded-md w-14" />
          <div className="h-6 bg-gray-200 rounded-md w-18" />
        </div>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Shorten New Link
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
