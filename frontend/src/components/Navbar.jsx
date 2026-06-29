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
        background: 'rgba(5,5,8,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(37,37,51,0.7)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center select-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-.02em' }}
        >
          <span className="text-[#E8E6FF]">Link</span>
          <span className="text-[#7C6FF7]">Lens</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-[#6B6A85] hover:text-[#E8E6FF] transition-colors duration-150"
              >
                Dashboard
              </Link>
              <span className="text-sm text-[#2E2E40] cursor-default select-none">Analytics</span>
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
          className="sm:hidden p-2 rounded-lg text-[#6B6A85] hover:text-[#E8E6FF] transition-colors"
          style={{ background: open ? '#1A1A25' : 'transparent' }}
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
          style={{ borderTop: '1px solid #252533', background: '#0A0A0F' }}
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-[#6B6A85] hover:text-[#E8E6FF] transition-colors py-2 px-2 rounded-lg hover:bg-[#1A1A25]"
              >
                Dashboard
              </Link>
              <span className="flex items-center gap-2 text-sm text-[#2E2E40] py-2 px-2 select-none">
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
              className="flex items-center gap-2 text-sm text-[#7C6FF7] font-medium py-2 px-2"
            >
              Login →
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
