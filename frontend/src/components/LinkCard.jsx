import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

const BASE_URL = import.meta.env.VITE_API_URL

export default function LinkCard({ link, onToggle, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const shortUrl = `${BASE_URL}/r/${link.shortId}`
  const truncated = link.originalUrl.length > 50 ? link.originalUrl.slice(0, 50) + '…' : link.originalUrl
  const createdAt = new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggle() {
    setToggling(true)
    try {
      const { data } = await api.patch(`/api/links/${link.shortId}/toggle`)
      onToggle(link.shortId, data.isActive)
    } catch {
      // silent
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await api.delete(`/api/links/${link.shortId}`)
      onDelete(link.shortId)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-indigo-600 text-sm truncate">{shortUrl}</p>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <p className="text-gray-400 text-xs truncate" title={link.originalUrl}>{truncated}</p>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
            {link.clickCount} clicks
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${link.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {link.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 shrink-0">{createdAt}</span>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {toggling ? '…' : link.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
            disabled={deleting}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 ${
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'border border-gray-200 text-red-500 hover:bg-red-50'
            }`}
          >
            {deleting ? '…' : confirmDelete ? 'Sure?' : 'Delete'}
          </button>
          <button
            onClick={() => navigate(`/analytics/${link.shortId}`)}
            className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
