import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import QRModal from './QRModal'

const BASE_URL = import.meta.env.VITE_API_URL

export default function LinkCard({ link, onToggle, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const navigate = useNavigate()

  const shortUrl = `${BASE_URL}/r/${link.shortId}`
  const truncated = link.originalUrl.length > 52 ? link.originalUrl.slice(0, 52) + '…' : link.originalUrl
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
    } catch { /* silent */ }
    finally { setToggling(false) }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
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
    <div
      className="card-hover rounded-xl p-4 space-y-3"
      style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 1px 6px rgba(26,26,20,.04)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="url-glow text-sm font-medium truncate">{shortUrl}</p>

          <div className="flex items-center gap-1.5 mt-1 min-w-0">
            <p
              className="text-[#A8A89C] text-xs truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              title={link.originalUrl}
            >
              {truncated}
            </p>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[#C4C0B8] hover:text-[#FF6B2B] transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: 'rgba(3,105,161,.07)', color: '#0369A1', border: '1px solid rgba(3,105,161,.12)' }}
          >
            {link.clickCount}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={link.isActive
              ? { background: 'rgba(34,197,94,.08)', color: '#16A34A', border: '1px solid rgba(34,197,94,.18)' }
              : { background: 'rgba(220,38,38,.07)', color: '#DC2626', border: '1px solid rgba(220,38,38,.15)' }
            }
          >
            {link.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#C4C0B8] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {createdAt}
        </span>

        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-1.5">
          <button onClick={handleCopy} className="btn-ghost px-2.5 py-1 text-xs rounded-lg">
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          <button onClick={() => setShowQR(true)} className="btn-ghost px-2.5 py-1 text-xs rounded-lg">
            QR
          </button>

          <button
            onClick={handleToggle}
            disabled={toggling}
            className="btn-ghost px-2.5 py-1 text-xs rounded-lg"
          >
            {toggling ? '…' : link.isActive ? 'Deactivate' : 'Activate'}
          </button>

          <button
            onClick={handleDelete}
            onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
            disabled={deleting}
            className="px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150"
            style={confirmDelete
              ? { background: '#DC2626', color: '#fff', border: '1px solid #DC2626' }
              : { background: 'transparent', color: '#DC2626', border: '1px solid rgba(220,38,38,.2)' }
            }
          >
            {deleting ? '…' : confirmDelete ? 'Sure?' : 'Delete'}
          </button>

          <button
            onClick={() => navigate(`/analytics/${link.shortId}`)}
            className="btn-primary px-2.5 py-1 text-xs rounded-lg"
          >
            Analytics
          </button>
        </div>
      </div>

      {showQR && (
        <QRModal shortUrl={shortUrl} shortId={link.shortId} onClose={() => setShowQR(false)} />
      )}
    </div>
  )
}
