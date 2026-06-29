import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(249,248,245,0.92)' : 'rgba(249,248,245,0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? '#D4D1CA' : '#E0DDD6'}`,
        boxShadow: scrolled ? '0 1px 12px rgba(26,26,20,.06)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center select-none"
          style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '1.2rem', letterSpacing: '-.01em' }}
        >
          <span className="text-[#1A1A14]">Link</span>
          <span className="text-[#1A1A14]">Lens</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-[#6B6B5E] hover:text-[#1A1A14] transition-colors duration-150"
              >
                Dashboard
              </Link>
              {user?.name && (
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{ background: 'rgba(26,26,20,.06)', color: '#1A1A14', fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  {user.name}
                </span>
              )}
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
          className="sm:hidden p-2 rounded-lg text-[#6B6B5E] hover:text-[#1A1A14] transition-colors"
          style={{ background: open ? '#F3F1EC' : 'transparent' }}
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
          style={{ borderTop: '1px solid #E0DDD6', background: '#F9F8F5' }}
        >
          {isAuthenticated ? (
            <>
              {user?.name && (
                <div className="px-2 py-1.5 mb-1">
                  <span className="text-xs text-[#A8A89C]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Signed in as
                  </span>
                  <p className="text-sm font-medium text-[#1A1A14] mt-0.5">{user.name}</p>
                </div>
              )}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-[#6B6B5E] hover:text-[#1A1A14] transition-colors py-2 px-2 rounded-lg hover:bg-[#F3F1EC]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setOpen(false); handleLogout() }}
                className="flex w-full items-center gap-2 text-sm text-[#DC2626] hover:text-[#B91C1C] transition-colors py-2 px-2 rounded-lg hover:bg-[rgba(220,38,38,.05)]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm text-[#1A1A14] font-medium py-2 px-2"
            >
              Login →
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
