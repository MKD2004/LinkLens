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
    <div className="flex flex-col items-center py-8 sm:py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">LinkLens</h1>

        <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
