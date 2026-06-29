import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password || (tab === 'register' && !name)) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = tab === 'login'
        ? { email: email.trim(), password }
        : { name, email: email.trim(), password }
      const { data } = await api.post(endpoint, payload)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      if (status === 409) setError('An account with this email already exists')
      else if (status === 401) setError('Incorrect email or password')
      else setError('Something went wrong, please try again')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] py-10 relative">

      {/* Warm spotlight */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(26,26,20,0.04) 0%, transparent 60%)' }}
      />

      <div className="w-full max-w-md animate-fade-up">

        {/* Brand */}
        <div className="text-center mb-8">
          <span
            className="text-3xl select-none"
            style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, letterSpacing: '-.02em' }}
          >
            <span className="text-[#1A1A14]">Link</span>
            <span className="text-[#1A1A14]">Lens</span>
          </span>
          <p className="text-[#6B6B5E] text-sm mt-1.5" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            {tab === 'login' ? 'Welcome back.' : 'Create your account.'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: '#FFFFFF', border: '1px solid #E0DDD6', boxShadow: '0 2px 16px rgba(26,26,20,.06)' }}
        >
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-6 gap-1"
            style={{ background: '#F3F1EC' }}
          >
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={
                  tab === t
                    ? { background: '#1A1A14', color: '#F9F8F5', boxShadow: '0 2px 8px rgba(26,26,20,.2)' }
                    : { background: 'transparent', color: '#6B6B5E' }
                }
              >
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <input
                className="input-dark"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <input
              className="input-dark"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="input-dark"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-3.5 py-2.5"
                style={{ background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.15)' }}
              >
                <svg className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-[#DC2626] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-1"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Please wait...
                </>
              ) : tab === 'login' ? 'Login →' : 'Create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
