import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(13,17,23,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(36,48,73,0.8)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center select-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-.02em' }}
        >
          <span className="text-[#F0F6FF]">Link</span>
          <span className="text-[#FF6B2B]">Lens</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-[#5A6E8F] hover:text-[#F0F6FF] transition-colors duration-150"
              >
                Dashboard
              </Link>
              <span className="text-sm text-[#243049] cursor-default select-none">Analytics</span>
              <button onClick={handleLogout} className="btn-ghost px-3.5 py-1.5 text-sm">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary px-4 py-1.5 text-sm rounded-lg">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="sm:hidden p-2 rounded-lg text-[#5A6E8F] hover:text-[#F0F6FF] transition-colors"
          style={{ background: open ? '#1E2A40' : 'transparent' }}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="sm:hidden px-4 py-4 space-y-1 animate-fade-up"
          style={{ borderTop: '1px solid #243049', background: '#111822' }}
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-[#5A6E8F] hover:text-[#F0F6FF] transition-colors py-2 px-2 rounded-lg hover:bg-[#1E2A40]"
              >
                Dashboard
              </Link>
              <span className="flex items-center gap-2 text-sm text-[#243049] py-2 px-2 select-none">
                Analytics
              </span>
              <button
                onClick={() => { setOpen(false); handleLogout() }}
                className="flex w-full items-center gap-2 text-sm text-[#F87171] hover:text-[#FF8787] transition-colors py-2 px-2 rounded-lg hover:bg-[rgba(248,113,113,.06)]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm text-[#FF6B2B] font-medium py-2 px-2"
            >
              Login →
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
